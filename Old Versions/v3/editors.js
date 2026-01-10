/**
 * editors.js - Kombinierte Version
 */
const Editors = {

    // --- 1. ACCOUNTS (Mit "Home Share" Feature) ---
    renderAccountEditor(block, container) {
        const div = document.createElement('div');
        div.className = 'editor-card';
        div.style.borderTopColor = '#22c55e'; // Grün
        div.innerHTML = `
            <h3 style="margin-top:0">Benutzer & Home-Shares</h3>
            <table id="accTable">
                <thead>
                    <tr>
                        <th style="width:30px">Aktiv</th>
                        <th>Benutzername</th>
                        <th>Passwort</th>
                        <th style="width:80px; text-align:center">🏠 Home</th>
                        <th style="width:80px">Limit (GB)</th>
                        <th style="width:50px"></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button class="btn btn-add" style="margin-top:10px" onclick="Editors.addAccount(${block.order})">+ User</button>
        `;
        
        const tbody = div.querySelector('tbody');
        const lines = block.content.split('\n');
        
        lines.forEach((line) => {
            if (!line.trim() || line.startsWith('[')) return;
            const isActive = !line.trim().startsWith('#');
            const clean = line.replace(/^\s*#\s*/, '').trim();
            const [user, pass] = clean.split(':').map(s => s?.trim());
            if (user) tbody.appendChild(this.createAccRow(isActive, user, pass, block.order));
        });
        
        container.appendChild(div);
    },

    createAccRow(active, user, pass, order) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" ${active?'checked':''} onchange="Editors.syncAccounts(${order})"></td>
            <td><input type="text" value="${user}" style="width:100%" oninput="Editors.syncAccounts(${order})"></td>
            <td><input type="text" value="${pass||''}" style="width:100%" oninput="Editors.syncAccounts(${order})"></td>
            <td style="text-align:center">
                <input type="checkbox" class="share-toggle" onchange="Editors.toggleLimit(this); UI.updateBash()">
            </td>
            <td>
                <input type="number" class="share-limit" value="50" style="width:100%; display:none" oninput="UI.updateBash()">
            </td>
            <td><button class="btn btn-del" onclick="this.closest('tr').remove(); Editors.syncAccounts(${order})">X</button></td>
        `;
        return tr;
    },

    toggleLimit(cb) {
        const row = cb.closest('tr');
        row.querySelector('.share-limit').style.display = cb.checked ? 'block' : 'none';
    },

    addAccount(order) {
        const tbody = document.querySelector('#accTable tbody');
        tbody.appendChild(this.createAccRow(true, "user"+Math.floor(Math.random()*100), PasswordGenerator.generate(), order));
        this.syncAccounts(order);
    },

    syncAccounts(order) {
        const rows = document.querySelectorAll('#accTable tbody tr');
        let txt = "[accounts]\n";
        rows.forEach(r => {
            const act = r.cells[0].querySelector('input').checked;
            const u = r.cells[1].querySelector('input').value;
            const p = r.cells[2].querySelector('input').value;
            if(u) txt += `  ${act?'':'# '}${u}: ${p}\n`;
        });
        UI.syncBlock(order, txt);
    },

    getCurrentUsers() {
        const rows = document.querySelectorAll('#accTable tbody tr');
        return Array.from(rows).map(r => r.cells[1].querySelector('input').value).filter(u => u);
    },

    // --- 2. GROUPS MATRIX (Editierbar!) ---
    renderGroupEditor(block, container) {
        const allUsers = this.getCurrentUsers();
        // Parsing Logic aus deiner Version
        const groups = block.content.split('\n')
            .filter(l => l.trim() && !l.startsWith('[') && !l.startsWith('#'))
            .map(line => {
                const [name, raw] = line.split(':').map(s => s.trim());
                return { name, members: raw ? raw.split(',').map(m => m.trim()) : [] };
            });
        
        const grpNames = groups.map(g => g.name);

        const div = document.createElement('div');
        div.className = 'editor-card';
        div.style.borderTopColor = '#eab308'; // Gelb
        div.innerHTML = `
            <h3 style="margin-top:0">Gruppen Matrix</h3>
            <div class="matrix-container">
                <table class="matrix-table" id="grpMatrix">
                    <thead>
                        <tr>
                            <th style="vertical-align:bottom">Gruppe</th>
                            <th class="rotate"><div>@acct</div></th>
                            ${allUsers.map(u => `<th class="rotate"><div>${u}</div></th>`).join('')}
                            ${grpNames.map(g => `<th class="rotate" style="color:#eab308"><div>@${g}</div></th>`).join('')}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <button class="btn btn-add" style="margin-top:10px" onclick="Editors.addGroup(${block.order})">+ Gruppe</button>
        `;

        const tbody = div.querySelector('tbody');
        groups.forEach(g => {
            const tr = document.createElement('tr');
            // Name Input
            let html = `<td><input type="text" value="${g.name}" class="grp-name" style="font-weight:bold; width:120px" oninput="Editors.syncGroups(${block.order})"></td>`;
            
            // @acct Cell
            html += this.createMatrixCell(g, '@acct', block.order);

            // Users
            allUsers.forEach(u => html += this.createMatrixCell(g, u, block.order));

            // Other Groups
            grpNames.forEach(tg => {
                if(tg === g.name) html += `<td class="matrix-cell locked">/</td>`;
                else html += this.createMatrixCell(g, '@'+tg, block.order);
            });

            html += `<td><button class="btn btn-del" onclick="this.closest('tr').remove(); Editors.syncGroups(${block.order})">X</button></td>`;
            tr.innerHTML = html;
            tbody.appendChild(tr);
        });

        container.appendChild(div);
    },

    createMatrixCell(group, target, order) {
        const isInc = group.members.includes(target);
        const isExc = group.members.includes('-' + target);
        const state = isInc ? '+' : (isExc ? '-' : '');
        return `<td class="matrix-cell" data-state="${state}" data-target="${target}" onclick="Editors.cycleMatrix(this, ${order})">${state}</td>`;
    },

    cycleMatrix(cell, order) {
        if(cell.classList.contains('locked')) return;
        const states = ['', '+', '-'];
        let idx = states.indexOf(cell.dataset.state);
        let next = states[(idx + 1) % 3];
        cell.dataset.state = next;
        cell.innerText = next;
        this.syncGroups(order);
    },

    addGroup(order) {
        // Simpel: Fügt Dummy Text hinzu und rendert neu via Sync
        const current = UI.blocks.find(b => b.order === order).content;
        UI.syncBlock(order, current + "\n  neueGruppe:");
        UI.renderAll(); // Full rerender needed for matrix structure
    },

    syncGroups(order) {
        const rows = document.querySelectorAll('#grpMatrix tbody tr');
        let txt = "[groups]\n";
        rows.forEach(r => {
            const name = r.querySelector('.grp-name').value.trim();
            if(!name) return;
            
            let members = [];
            r.querySelectorAll('.matrix-cell').forEach(cell => {
                const st = cell.dataset.state;
                const tgt = cell.dataset.target;
                if(st === '+') members.push(tgt);
                if(st === '-') members.push('-'+tgt);
            });
            
            txt += `  ${name}: ${members.join(', ')}\n`;
        });
        UI.syncBlock(order, txt);
    },


    // --- 3. SHARES (Visuell aufgehübscht, Schrift normal) ---
    renderShareEditor(block, container) {
        const div = document.createElement('div');
        div.className = 'editor-card';
        div.style.borderTopColor = '#3b82f6'; // Blau
        div.id = `share-${block.order}`;

        // Daten extrahieren
        const lines = block.content.split('\n');
        let vfs = block.title;
        let hdd = "/mnt/storage" + vfs;
        const resLine = lines.find(l => l.trim().startsWith('res:'));
        if(resLine) hdd = resLine.split(':')[1].trim();

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px">
                <h3 style="margin:0; color:var(--accent)">Share Config</h3>
                <button class="btn btn-del" onclick="Editors.removeBlock(${block.order})">Share Löschen</button>
            </div>
            
            <div class="share-header" style="display:flex; gap:20px; margin-bottom:20px; flex-wrap:wrap">
                <div style="flex:1; min-width:250px">
                    <label class="field-label">Web-Pfad (URL)</label>
                    <input type="text" class="vfs-input" value="${vfs}" style="width:100%" oninput="Editors.syncShare(${block.order})">
                </div>
                <div style="flex:2; min-width:250px">
                    <label class="field-label">Verzeichnis (HDD)</label>
                    <input type="text" class="hdd-input" value="${hdd}" style="width:100%" oninput="Editors.syncShare(${block.order})">
                </div>
            </div>

            <label class="field-label">Berechtigungen & Flags</label>
            <div class="params-container" style="display:flex; flex-direction:column; gap:8px;"></div>
            <button class="btn" style="margin-top:10px; width:100%" onclick="Editors.addParamRow(${block.order})">+ Option hinzufügen</button>
        `;

        container.appendChild(div);
        
        // Zeilen parsen und rendern
        const paramContainer = div.querySelector('.params-container');
        lines.forEach(line => {
            const l = line.trim();
            if(!l || l.startsWith('[') || l.startsWith('res:')) return;
            
            // Einfache Heuristik für Key: Value
            let key = l; 
            let val = "";
            if(l.includes(':')) {
                const parts = l.split(':');
                key = parts[0].trim();
                val = parts.slice(1).join(':').trim();
            }
            this.appendParamRow(paramContainer, key, val, block.order);
        });
    },

    appendParamRow(container, key, val, order) {
        const div = document.createElement('div');
        div.style.display = "flex"; div.style.gap = "10px";
        div.innerHTML = `
            <input type="text" list="params-list" value="${key}" placeholder="Option (z.B. accs, r)" style="width:150px" oninput="Editors.syncShare(${order})">
            <input type="text" value="${val}" placeholder="Wert (z.B. admin, rw)" style="flex:1" oninput="Editors.syncShare(${order})">
            <button class="btn btn-del" onclick="this.parentElement.remove(); Editors.syncShare(${order})">X</button>
        `;
        container.appendChild(div);
    },

    addParamRow(order) {
        const container = document.querySelector(`#share-${order} .params-container`);
        this.appendParamRow(container, "", "", order);
    },

    syncShare(order) {
        const root = document.getElementById(`share-${order}`);
        const vfs = root.querySelector('.vfs-input').value;
        const hdd = root.querySelector('.hdd-input').value;
        
        let txt = `[${vfs}]\n  res: ${hdd}\n`;
        
        root.querySelectorAll('.params-container > div').forEach(row => {
            const inputs = row.querySelectorAll('input');
            const k = inputs[0].value.trim();
            const v = inputs[1].value.trim();
            if(k) txt += `  ${k}${v ? ': '+v : ''}\n`;
        });
        
        UI.syncBlock(order, txt);
    },

    addShareBlock() {
        const order = Math.max(...UI.blocks.map(b=>b.order)) + 10;
        UI.blocks.push({
            order: order, type: 'share', title: '/neu',
            content: '[/neu]\n  res: /mnt/storage/neu\n  accs:\n    rw: @admin'
        });
        UI.renderAll();
    },

    removeBlock(order) {
        if(confirm('Block wirklich löschen?')) {
            UI.blocks = UI.blocks.filter(b => b.order !== order);
            UI.renderAll();
        }
    }
};
