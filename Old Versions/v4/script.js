/**
 * COPYPARTY EDITOR PRO - script.js
 * V2.3 - Fixed Focus Retention on Live-Update
 */

const PasswordGenerator = {
    adjectives: ["Schnelle", "Blaue", "Rote", "Wilde", "Helle", "Alte", "Gute", "Bunte", "Schlaue"],
    nouns: ["Affen", "Tiger", "Berge", "Haeuser", "Waelder", "Steine", "Wolken", "Fische", "Adler"],
    generate() {
        const r = (a) => a[Math.floor(Math.random() * a.length)];
        return `${Math.floor(Math.random() * 90) + 10}${r(this.adjectives)}${r(this.nouns)}`;
    }
};

const App = {
    blocks: [],
    users: [],
    shareState: {}, 
    
    init() {
        document.getElementById('fileInput').addEventListener('change', (e) => this.loadFile(e));
        const dz = document.getElementById('drop-zone');
        dz.addEventListener('click', () => document.getElementById('fileInput').click());
        dz.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
        dz.addEventListener('drop', (e) => { e.preventDefault(); this.loadFile({ target: { files: e.dataTransfer.files } }); });
        
        document.getElementById('theme-toggle').addEventListener('click', () => document.body.classList.toggle('dark-mode'));
        document.getElementById('toggleAdvanced').addEventListener('change', (e) => {
            document.getElementById('section-raw').classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('bashOutput').addEventListener('click', async (e) => {
            try {
                await navigator.clipboard.writeText(e.target.value);
                const original = document.querySelector('.footer-header strong').innerText;
                document.querySelector('.footer-header strong').innerText = "✅ Kopiert!";
                setTimeout(() => document.querySelector('.footer-header strong').innerText = original, 2000);
            } catch (err) { e.target.select(); }
        });

        this.renderAll();
    },

    loadFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            this.parseConfig(ev.target.result);
            this.renderAll();
        };
        reader.readAsText(file);
    },

    parseConfig(raw) {
        const regex = /^\[/gm;
        let match, indices = [];
        while ((match = regex.exec(raw)) !== null) indices.push(match.index);
        this.blocks = indices.map((start, i) => {
            const end = (i + 1 < indices.length) ? indices[i + 1] : raw.length;
            const content = raw.substring(start, end).trim();
            const titleMatch = content.match(/^\[(.*?)\]/);
            const title = titleMatch ? titleMatch[1] : "unknown";
            let type = (title === 'accounts') ? 'accounts' : (title === 'groups' ? 'groups' : (title.startsWith('/') ? 'share' : (title === 'global' ? 'global' : 'other')));
            return { id: i, type, title, content };
        });
        this.shareState = {};
    },

    renderAll() {
        this.extractGlobals();
        this.renderAccounts();
        this.renderGroups();
        this.renderShares();
        this.renderRaw();
        this.updateBash();
    },

    extractGlobals() {
        this.users = [];
        const accBlock = this.blocks.find(b => b.type === 'accounts');
        if (accBlock) {
            accBlock.content.split('\n').forEach(l => {
                const clean = l.replace(/^#\s*/, '').trim();
                if (clean.includes(':') && !clean.startsWith('[')) {
                    this.users.push(clean.split(':')[0].trim());
                }
            });
        }
        
        const dl = document.getElementById('users-list');
        dl.innerHTML = '';
        const grpBlock = this.blocks.find(b => b.type === 'groups');
        if(grpBlock) {
            grpBlock.content.split('\n').forEach(l => {
                const clean = l.replace(/^#\s*/, '').trim();
                if(clean && !clean.startsWith('[') && clean.includes(':')) {
                     const opt = document.createElement('option');
                     opt.value = '@' + clean.split(':')[0].trim();
                     dl.appendChild(opt);
                }
            });
        }
        this.users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u;
            dl.appendChild(opt);
        });
        const acctOpt = document.createElement('option');
        acctOpt.value = '@acct';
        dl.appendChild(acctOpt);
    },

    // --- ACCOUNTS ---
    renderAccounts() {
        const container = document.getElementById('accounts-editor');
        const block = this.blocks.find(b => b.type === 'accounts');
        if (!block) return;

        let html = `<div class="table-responsive"><table><thead><tr><th>On</th><th>User</th><th>Passwort</th><th>Home</th><th>GB</th></tr></thead><tbody>`;
        block.content.split('\n').slice(1).forEach((line, idx) => {
            if (!line.trim()) return;
            const isComment = line.trim().startsWith('#');
            const clean = line.replace(/^#\s*/, '');
            const [user, pass] = clean.split(':').map(s => s ? s.trim() : '');
            html += `
                <tr>
                    <td><input type="checkbox" class="acc-active" ${!isComment ? 'checked' : ''} onchange="App.syncAccounts()"></td>
                    <td><input type="text" maxlength="12" value="${user}" class="acc-user" oninput="App.syncAccounts()" data-path="acc-${idx}-u"></td>
                    <td><div class="pw-wrapper"><input type="password" value="${pass}" class="acc-pass" oninput="App.syncAccounts()" data-path="acc-${idx}-p"><button class="btn" onclick="App.togglePw(this)">👁️</button><button class="btn" onclick="App.genPw(this)">🎲</button></div></td>
                    <td><input type="checkbox" class="acc-home" onchange="App.updateBash()"></td>
                    <td><input type="number" value="50" class="acc-limit" style="width:50px" onchange="App.updateBash()"></td>
                </tr>`;
        });
        html += `</tbody></table></div><button class="btn btn-add" onclick="App.addAccount()">+ User</button>`;
        container.innerHTML = html;
    },

    togglePw(btn) {
        const input = btn.parentElement.querySelector('input');
        input.type = input.type === 'password' ? 'text' : 'password';
    },

    genPw(btn) {
        const input = btn.parentElement.querySelector('input');
        input.value = PasswordGenerator.generate();
        input.type = 'text';
        this.syncAccounts();
    },

    syncAccounts() {
        const rows = document.querySelectorAll('#accounts-editor tbody tr');
        let content = "[accounts]\n";
        rows.forEach(row => {
            const active = row.querySelector('.acc-active').checked;
            const user = row.querySelector('.acc-user').value;
            const pass = row.querySelector('.acc-pass').value;
            if (user) content += `  ${active ? '' : '# '}${user}: ${pass}\n`;
        });
        this.updateBlock('accounts', content);
        this.extractGlobals();
        this.renderGroups(); 
    },

    addAccount() {
        const block = this.blocks.find(b => b.type === 'accounts');
        block.content += `\n  neuerUser: ${PasswordGenerator.generate()}`;
        this.renderAll();
    },

    // --- GROUPS MATRIX ---
    renderGroups() {
        // Fokus-Status sichern
        const activeId = document.activeElement ? document.activeElement.getAttribute('data-path') : null;
        const scrollPos = document.querySelector('.matrix-wrapper') ? document.querySelector('.matrix-wrapper').scrollLeft : 0;
        const selectionStart = document.activeElement ? document.activeElement.selectionStart : null;

        const container = document.getElementById('groups-editor');
        const block = this.blocks.find(b => b.type === 'groups');
        if (!block) return;

        const lines = block.content.split('\n').filter(l => !l.startsWith('[') && l.trim());
        const groupsData = lines.map(l => {
            const isComment = l.trim().startsWith('#');
            const clean = l.replace(/^#\s*/, '');
            const [name, mems] = clean.split(':');
            return { name: name.trim(), members: mems ? mems.split(',').map(m => m.trim()) : [], active: !isComment };
        });

        const groupNames = groupsData.map(g => g.name);
        const colHeaderEntities = ['@acct', ...this.users, ...groupNames.map(gn => '@' + gn)];
        const dataMatchEntities = ['@acct', ...this.users, ...groupNames];
        
        let html = `<div class="matrix-wrapper"><table class="matrix-table"><thead><tr><th>On</th><th>Gruppe</th>`;
        colHeaderEntities.forEach(e => html += `<th class="rotate"><div>${e}</div></th>`);
        html += `</tr></thead><tbody>`;

        groupsData.forEach((grp, idx) => {
            html += `<tr>
                <td><input type="checkbox" class="grp-active" ${grp.active ? 'checked' : ''} onchange="App.syncGroups(true)"></td>
                <td><input type="text" maxlength="12" value="${grp.name}" oninput="App.syncGroups(true)" class="grp-name" data-path="grp-name-${idx}"></td>`;
            dataMatchEntities.forEach(ent => {
                let state = grp.members.includes(ent) ? '+' : (grp.members.includes('-' + ent) ? '-' : '');
                const isSelf = (ent === grp.name);
                html += `<td class="matrix-cell ${isSelf ? 'self' : ''}" data-state="${state}" onclick="${isSelf ? '' : 'App.cycleMatrix(this)'}">${state}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table></div><button class="btn btn-add" onclick="App.addGroup()">+ Gruppe</button>`;
        container.innerHTML = html;

        // Fokus wiederherstellen
        if (activeId) {
            const el = document.querySelector(`[data-path="${activeId}"]`);
            if (el) {
                el.focus();
                if (selectionStart !== null) el.setSelectionRange(selectionStart, selectionStart);
            }
        }
        if (scrollPos) document.querySelector('.matrix-wrapper').scrollLeft = scrollPos;
    },

    cycleMatrix(cell) {
        const states = ['', '+', '-'];
        cell.setAttribute('data-state', states[(states.indexOf(cell.getAttribute('data-state')) + 1) % 3]);
        cell.innerText = cell.getAttribute('data-state');
        this.syncGroups(false);
    },

    syncGroups(redraw = false) {
        const rows = document.querySelectorAll('.matrix-table tbody tr');
        let content = "[groups]\n";
        const currentGroupNames = Array.from(rows).map(r => r.querySelector('.grp-name').value);
        const dataMatchEntities = ['@acct', ...this.users, ...currentGroupNames];
        
        rows.forEach(row => {
            const active = row.querySelector('.grp-active').checked;
            const name = row.querySelector('.grp-name').value;
            if(!name) return;
            let mems = [];
            row.querySelectorAll('.matrix-cell').forEach((cell, i) => {
                const s = cell.getAttribute('data-state');
                if (s === '+') mems.push(dataMatchEntities[i]);
                else if (s === '-') mems.push('-' + dataMatchEntities[i]);
            });
            content += `  ${active ? '' : '# '}${name}: ${mems.join(', ')}\n`;
        });
        this.updateBlock('groups', content);
        if (redraw) { 
            this.extractGlobals(); 
            this.renderGroups(); 
        }
    },

    addGroup() {
        const block = this.blocks.find(b => b.type === 'groups');
        block.content += "\n  neueGruppe:";
        this.renderAll(); 
    },

    // --- SHARES ---
    parseShareAccs(lines) {
        let slots = [{ perms: "", users: [] }, { perms: "", users: [] }, { perms: "", users: [] }];
        let slotIdx = 0;
        lines.forEach(l => {
            const parts = l.split(':');
            if (parts.length >= 2 && slotIdx < 3) {
                slots[slotIdx] = { perms: parts[0].trim(), users: parts[1].split(',').map(x => x.trim()).filter(x => x) };
                slotIdx++;
            }
        });
        return slots;
    },

    renderShares() {
        const container = document.getElementById('shares-container');
        container.innerHTML = "";
        this.blocks.filter(b => b.type === 'share').forEach(block => {
            if (!this.shareState[block.id]) {
                const lines = block.content.split('\n');
                let accsLines = [], section = '';
                lines.forEach(l => {
                    if(l.trim().startsWith('accs:')) section = 'accs';
                    else if(l.trim().match(/^(flags|res):/)) section = 'other';
                    else if(section === 'accs' && l.includes(':')) accsLines.push(l.trim());
                });
                this.shareState[block.id] = { activeSlot: 0, slots: this.parseShareAccs(accsLines) };
            }
            const el = document.createElement('div');
            el.className = 'share-card';
            el.innerHTML = this.buildShareCardHTML(block);
            container.appendChild(el);
            this.initShareCardEvents(el, block);
        });
    },

    buildShareCardHTML(block) {
        const lines = block.content.split('\n');
        let path = "", flagsLines = [], section = 'head';
        lines.forEach(l => {
            if (l.trim().startsWith('res:')) path = l.split('res:')[1].trim();
            else if (l.trim().startsWith('accs:')) section = 'accs';
            else if (l.trim().startsWith('flags:')) section = 'flags';
            else if (section === 'flags' && l.trim()) flagsLines.push(l.trim());
        });

        const state = this.shareState[block.id];
        const activeSlot = state.slots[state.activeSlot];
        
        let mixerHTML = "";
        for(let i=0; i<8; i++) {
            let uFull = activeSlot.users[i] || "";
            let isNeg = uFull.startsWith('-');
            let uName = isNeg ? uFull.substring(1) : uFull;
            let bState = uFull ? (isNeg ? "2" : "1") : "0";
            mixerHTML += `
            <div class="actor-strip">
                <div class="knob" data-state="${bState}" onclick="App.cycleKnob(this, ${block.id})"></div>
                <input type="text" list="users-list" class="vertical-text" value="${uName}" oninput="App.syncFromEditor(${block.id})">
            </div>`;
        }

        let switcherHTML = `<div class="slot-switcher">`;
        state.slots.forEach((slot, idx) => {
            let preview = slot.perms ? `${slot.perms}: ${slot.users.join(', ')}` : "";
            switcherHTML += `
                <div class="slot-row">
                    <input type="radio" name="slot-${block.id}" ${idx === state.activeSlot ? 'checked' : ''} onchange="App.switchSlot(${block.id}, ${idx})">
                    <input type="text" class="slot-text" value="${preview}" oninput="App.syncFromText(${block.id}, ${idx}, this.value)">
                </div>`;
        });
        switcherHTML += `</div>`;

        const makeCheck = (v, l) => `<label><input type="checkbox" value="${v}" ${activeSlot.perms.includes(v)?'checked':''} onchange="App.syncFromEditor(${block.id})"> ${l}</label>`;

        return `
            <div class="share-header"><b>URL:</b><input type="text" value="${block.title.replace(/[\[\]]/g,'')}" class="sh-url" oninput="App.flushShare(${block.id})"> <b>Path:</b><input type="text" value="${path}" class="sh-path" oninput="App.flushShare(${block.id})"><button class="btn btn-del" onclick="App.deleteBlock(${block.id})">X</button></div>
            <div class="share-main"><div class="actors-grid">${mixerHTML}</div><div class="perms-box"><div class="perm-checks"><div class="perm-col">${makeCheck('r','R')}${makeCheck('w','W')}${makeCheck('m','M')}${makeCheck('d','D')}</div><div class="perm-col">${makeCheck('a','a')}${makeCheck('A','A')}${makeCheck('g','g')}${makeCheck('.','.')}</div></div></div></div>
            ${switcherHTML}
            <div class="flags-container">${flagsLines.map(l => {
                const p = l.replace(/^#\s*/,'').split(':');
                return `<div class="flag-row"><input type="checkbox" ${!l.trim().startsWith('#')?'checked':''} onchange="App.flushShare(${block.id})"><input type="text" class="flag-key" value="${p[0].trim()}" oninput="App.flushShare(${block.id})"><input type="text" class="flag-val" value="${p[1]?p[1].trim():''}" oninput="App.flushShare(${block.id})"><button class="btn btn-del" onclick="this.parentElement.remove();App.flushShare(${block.id})">X</button></div>`
            }).join('')}</div><button class="btn" onclick="App.addFlagRow(${block.id})">+ Flag</button>`;
    },

    switchSlot(id, idx) { this.shareState[id].activeSlot = idx; this.reRenderShare(id); },

    reRenderShare(id) {
        const block = this.blocks.find(b => b.id === id);
        const cardIdx = this.blocks.filter(b=>b.type==='share').findIndex(b=>b.id===id);
        const container = document.getElementById('shares-container');
        if(cardIdx === -1) return;
        container.children[cardIdx].innerHTML = this.buildShareCardHTML(block);
        this.initShareCardEvents(container.children[cardIdx], block);
    },

    syncFromEditor(id) {
        const cardIdx = this.blocks.filter(b=>b.type==='share').findIndex(b=>b.id===id);
        const card = document.getElementById('shares-container').children[cardIdx];
        const state = this.shareState[id];
        const slot = state.slots[state.activeSlot];
        let u = [];
        card.querySelectorAll('.actor-strip').forEach(s => {
            const name = s.querySelector('input').value.trim();
            const ks = s.querySelector('.knob').getAttribute('data-state');
            if(name && ks === "1") u.push(name);
            else if(name && ks === "2") u.push('-' + name);
        });
        slot.users = u;
        slot.perms = Array.from(card.querySelectorAll('.perms-box input:checked')).map(c => c.value).join('');
        this.flushShare(id);
        card.querySelectorAll('.slot-text')[state.activeSlot].value = slot.perms ? `${slot.perms}: ${slot.users.join(', ')}` : "";
    },

    syncFromText(id, idx, val) {
        const slot = this.shareState[id].slots[idx];
        if(!val.includes(':')) { slot.perms = ""; slot.users = []; }
        else { const [p, u] = val.split(':'); slot.perms = p.trim(); slot.users = u.split(',').map(s=>s.trim()).filter(s=>s); }
        if(this.shareState[id].activeSlot === idx) this.reRenderShare(id);
        this.flushShare(id);
    },

    flushShare(id) {
        const block = this.blocks.find(b => b.id === id);
        const cardIdx = this.blocks.filter(b=>b.type==='share').findIndex(b=>b.id===id);
        const card = document.getElementById('shares-container').children[cardIdx];
        if(!card) return;
        const state = this.shareState[id];
        let accs = state.slots.map(s => s.perms && s.users.length ? `    ${s.perms}: ${s.users.join(', ')}` : "").filter(s=>s).join('\n');
        let flags = Array.from(card.querySelectorAll('.flag-row')).map(r => `    ${r.querySelector('input[type="checkbox"]').checked?'':'# '}${r.querySelector('.flag-key').value.trim()}: ${r.querySelector('.flag-val').value.trim()}`).join('\n');
        block.title = '/' + card.querySelector('.sh-url').value.replace(/^\//,'');
        block.content = `[${block.title.substring(1)}]\n  res: ${card.querySelector('.sh-path').value}\n  accs:\n${accs}\n  flags:\n${flags}`;
        this.renderRaw(); this.updateBash();
    },

    cycleKnob(el, id) {
        let s = (parseInt(el.getAttribute('data-state')) + 1) % 3;
        el.setAttribute('data-state', s);
        el.style.background = s === 1 ? 'var(--success)' : (s === 2 ? 'var(--danger)' : '#ccc');
        this.syncFromEditor(id);
    },

    initShareCardEvents(el, block) {
        el.querySelectorAll('.knob').forEach(k => {
            let s = parseInt(k.getAttribute('data-state'));
            k.style.background = s === 1 ? 'var(--success)' : (s === 2 ? 'var(--danger)' : '#ccc');
        });
    },

    addFlagRow(id) {
        const block = this.blocks.find(b => b.id === id);
        block.content += "\n    # neue_flag: wert";
        this.reRenderShare(id);
    },

    addShare() {
        this.blocks.push({ id: Date.now(), type: 'share', title: '/neu', content: `[/neu]\n  res: /mnt/storage/neu\n  accs:\n    r: @acct\n  flags:\n    av` });
        this.renderShares();
    },

    deleteBlock(id) { if(confirm("Löschen?")) { this.blocks = this.blocks.filter(b=>b.id!==id); this.renderAll(); } },

    updateBlock(type, content) {
        const b = this.blocks.find(b => b.type === type);
        if(b) b.content = content;
        this.renderRaw(); this.updateBash();
    },

    renderRaw() {
        const cont = document.getElementById('raw-container');
        cont.innerHTML = "";
        this.blocks.forEach(b => {
            const ta = document.createElement('textarea');
            ta.className = 'raw-editor';
            ta.value = b.content;
            ta.onblur = (e) => { b.content = e.target.value; this.renderAll(); };
            cont.appendChild(ta);
        });
    },

    updateBash() {
        let config = this.blocks.map(b => b.content).join('\n\n');
        let dirs = new Set(), root = "/mnt/storage";
        const rb = this.blocks.find(b => b.type === 'share' && b.title === '/');
        if(rb) { const m = rb.content.match(/res:\s*(.*)/); if(m) root = m[1].trim(); }
        this.blocks.forEach(b => { if(b.type==='share') { const m=b.content.match(/res:\s*(.*)/); if(m) dirs.add(m[1].trim()); } });
        const accs = document.querySelectorAll('#accounts-editor tbody tr');
        accs.forEach(r => {
            const u = r.querySelector('.acc-user').value;
            if(u && r.querySelector('.acc-active').checked && r.querySelector('.acc-home').checked) {
                const d = `${root}/pub/${u}`; dirs.add(d);
                config += `\n\n[/pub/${u}]\n  res: ${d}\n  accs:\n    rwmda: ${u}\n  flags:\n    av\n    vmaxb: ${r.querySelector('.acc-limit').value}g`;
            }
        });
        let opt = Array.from(dirs).map(p => p === root ? '"$R"' : (p.startsWith(root+'/') ? `"$R${p.substring(root.length)}"` : `"${p}"`));
        const b64 = btoa(unescape(encodeURIComponent(config)));
        document.getElementById('bashOutput').value = `# 1. Backup\ncp copyparty.conf cp_bak_$(date +%s)\n# 2. Setup\nR="${root}"; d=(${opt.join(' ')});\nfor n in "\${d[@]}"; do mkdir -p "$n"; done;\n# 3. Apply\necho "${b64}" | base64 -d > copyparty.conf\nsudo systemctl restart copyparty && echo "Done!"`;
    }
};

App.init();
