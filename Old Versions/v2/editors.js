/**
 * editors.js - Matrix-Version mit Account-Share-Templates
 */
const Editors = {
    // --- ACCOUNT EDITOR ---
    renderAccountEditor(content) {
        const lines = content.split('\n').slice(1);
        let html = `
            <div class="editor-card">
                <h2>User Accounts & Schnell-Shares</h2>
                <table id="accTable">
                    <thead>
                        <tr>
                            <th>Aktiv</th>
                            <th>Benutzername</th>
                            <th>Passwort</th>
                            <th>Pers. Share</th>
                            <th>Limit (GB)</th>
                            <th>Vorschau Pfad</th>
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>`;

        lines.forEach((line, index) => {
            if (!line.trim() || line.startsWith('[')) return;
            const isActive = !line.trim().startsWith('#');
            const cleanLine = line.replace(/^\s*#\s*/, '').trim();
            const [user, pass] = cleanLine.split(':').map(s => s?.trim());
            
            // Wir versuchen, aus dem aktuellen Share-Status (falls vorhanden) zu lesen
            // Hier als Initialwert (kann später durch Share-Parser verfeinert werden)
            if (user) html += this.createAccRow(isActive, user, pass, index);
        });

        html += `</tbody></table>
                <button class="btn btn-add" onclick="Editors.addAccount()">+ User hinzufügen</button>
            </div>`;
        document.getElementById('custom-editors').innerHTML = html;
    },

    createAccRow(active, user, pass, index) {
        const rowId = (index * 10) + 100;
        return `
            <tr data-row-id="${rowId}">
                <td><input type="checkbox" ${active ? 'checked' : ''} onchange="UI.syncFromEditor()"></td>
                <td><input type="text" value="${user}" oninput="Editors.updateSharePath(this); UI.syncFromEditor();"></td>
                <td>
                    <div class="pw-container">
                        <input type="password" value="${pass || ''}" oninput="UI.syncFromEditor()">
                        <button class="btn" onclick="Editors.togglePw(this)">👁️</button>
                    </div>
                </td>
                <td>
                    <input type="checkbox" class="share-toggle" onchange="Editors.toggleShareFields(this); UI.syncFromEditor();">
                </td>
                <td>
                    <input type="number" class="share-limit" value="50" min="1" style="width: 60px; display: none;" oninput="UI.syncFromEditor()">
                </td>
                <td>
                    <code class="share-path-preview" style="font-size: 0.8rem; color: #666; display: none;">/mnt/storage/pub/${user}</code>
                </td>
                <td><button class="btn btn-del" onclick="this.closest('tr').remove(); UI.syncFromEditor();">DEL</button></td>
            </tr>`;
    },

    // UI-Logik für die Einblendungen
    toggleShareFields(checkbox) {
        const row = checkbox.closest('tr');
        const limitInput = row.querySelector('.share-limit');
        const pathPreview = row.querySelector('.share-path-preview');
        const display = checkbox.checked ? 'inline-block' : 'none';
        
        limitInput.style.display = display;
        pathPreview.style.display = display;
    },

    updateSharePath(input) {
        const row = input.closest('tr');
        const preview = row.querySelector('.share-path-preview');
        preview.innerText = `/mnt/storage/pub/${input.value}`;
    },

    // --- GRUPPEN-MATRIX EDITOR ---
    renderGroupEditor(content, allUsers) {
        const groups = this.parseGroups(content);
        const groupNames = groups.map(g => g.name);
        
        let html = `
            <div class="editor-card" style="border-top-color: #ffc107; overflow-x: auto;">
                <h2>Gruppen-Matrix</h2>
                <table id="groupMatrix" class="matrix-table">
                    <thead>
                        <tr>
                            <th>Gruppe (Ziel)</th>
                            <th class="rotate special-col"><div><span>@acct</span></div></th>
                            ${allUsers.map(u => `<th class="rotate"><div><span>${u}</span></div></th>`).join('')}
                            ${groupNames.map(g => `<th class="rotate group-col"><div><span>@${g}</span></div></th>`).join('')}
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>`;

        groups.forEach(group => {
            html += this.createMatrixRow(group, allUsers, groupNames);
        });

        html += `</tbody></table>
                <button class="btn btn-add" style="background:#ffc107; color:black;" onclick="Editors.addGroup()">+ Neue Gruppe</button>
            </div>`;
        
        const container = document.getElementById('custom-editors');
        let groupDiv = document.getElementById('group-editor-container') || document.createElement('div');
        groupDiv.id = "group-editor-container";
        groupDiv.innerHTML = html;
        if (!document.getElementById('group-editor-container')) container.appendChild(groupDiv);
    },

    createMatrixRow(group, allUsers, allGroups) {
        const acctState = group.members.includes('@acct') ? '+' : (group.members.includes('-@acct') ? '-' : '');
        const acctCell = `<td class="matrix-cell" data-type="special" data-name="@acct" data-state="${acctState}" onclick="Editors.cycleState(this)">${acctState}</td>`;

        const userCells = allUsers.map(user => {
            const state = group.members.includes(user) ? '+' : (group.members.includes(`-${user}`) ? '-' : '');
            return `<td class="matrix-cell" data-type="user" data-name="${user}" data-state="${state}" onclick="Editors.cycleState(this)">${state}</td>`;
        }).join('');

        const groupCells = allGroups.map(targetGroupName => {
            if (targetGroupName === group.name) return `<td class="matrix-cell locked">/</td>`;
            const state = group.members.includes(`@${targetGroupName}`) ? '+' : (group.members.includes(`-@${targetGroupName}`) ? '-' : '');
            return `<td class="matrix-cell" data-type="group" data-name="@${targetGroupName}" data-state="${state}" onclick="Editors.cycleState(this)">${state}</td>`;
        }).join('');

        return `
            <tr>
                <td>
                    <input type="text" class="group-name-input" value="${group.name}" maxlength="12" 
                           oninput="Editors.handleNameInput(this)" onblur="UI.syncFromEditor()">
                </td>
                ${acctCell}
                ${userCells}
                ${groupCells}
                <td><button class="btn btn-del" onclick="this.closest('tr').remove(); UI.syncFromEditor();">DEL</button></td>
            </tr>`;
    },

    cycleState(cell) {
        if (cell.classList.contains('locked')) return;
        const states = ['', '+', '-'];
        let currIdx = states.indexOf(cell.getAttribute('data-state'));
        let nextIdx = (currIdx + 1) % states.length;
        cell.setAttribute('data-state', states[nextIdx]);
        cell.innerText = states[nextIdx];
        UI.syncFromEditor();
    },

    handleNameInput(input) {
        const grpBlock = UI.blocks.find(b => b.type === 'groups');
        if (grpBlock) {
            grpBlock.content = this.getGroupContentFromTable();
            const ta = document.querySelector(`textarea[data-order="${grpBlock.order}"]`);
            if (ta) ta.value = grpBlock.content;
        }
    },

    // --- HILFSFUNKTIONEN ---
    parseGroups(content) {
        if (!content) return [];
        return content.split('\n')
            .filter(l => l.trim() && !l.startsWith('[') && !l.startsWith('#'))
            .map(line => {
                const [name, membersRaw] = line.split(':').map(s => s.trim());
                return { name, members: membersRaw ? membersRaw.split(',').map(m => m.trim()) : [] };
            });
    },

    getAccountContentFromTable() {
        const rows = document.querySelectorAll('#accTable tbody tr');
        let content = "[accounts]\n";
        rows.forEach(row => {
            const active = row.cells[0].querySelector('input').checked;
            const user = row.cells[1].querySelector('input').value;
            const pass = row.cells[2].querySelector('input').value;
            if (user) content += `  ${active ? '' : '# '}${user}: ${pass}\n`;
        });
        return content;
    },

    getGroupContentFromTable() {
        const rows = document.querySelectorAll('#groupMatrix tbody tr');
        let content = "[groups]\n";
        rows.forEach(row => {
            const groupName = row.querySelector('.group-name-input').value;
            if (!groupName) return;

            const cells = row.querySelectorAll('.matrix-cell');
            let includes = [];
            let excludes = [];

            cells.forEach(cell => {
                const state = cell.getAttribute('data-state');
                const name = cell.getAttribute('data-name');
                if (state === '+') includes.push(name);
                if (state === '-') excludes.push(name);
            });

            if (includes.length > 0 || excludes.length > 0) {
                let base = (excludes.length > 0 && includes.length === 0) ? "@acct" : "";
                let members = [...includes, ...excludes.map(e => `-${e}`)].join(', ');
                content += `  ${groupName}: ${base}${base && members ? ', ' : ''}${members}\n`;
            } else {
                content += `  ${groupName}:\n`;
            }
        });
        return content;
    },

addAccount() {
        const tbody = document.querySelector('#accTable tbody');
        if (tbody) {
            // Zähle vorhandene Zeilen für die ID-Generierung
            const index = tbody.querySelectorAll('tr').length;
            tbody.insertAdjacentHTML('beforeend', this.createAccRow(true, "neuerUser", PasswordGenerator.generate(), index));
            UI.syncFromEditor();
        }
    },

    addGroup() {
        const currentContent = this.getGroupContentFromTable() + "  neueGruppe:\n";
        this.renderGroupEditor(currentContent, this.getCurrentUsers());
        UI.syncFromEditor();
    },

    getCurrentUsers() {
        return Array.from(document.querySelectorAll('#accTable tbody tr'))
            .map(r => r.cells[1].querySelector('input').value)
            .filter(u => u);
    },

    togglePw(btn) {
        const i = btn.parentElement.querySelector('input');
        i.type = i.type === 'password' ? 'text' : 'password';
    }
};
