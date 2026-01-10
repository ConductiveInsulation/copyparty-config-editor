/**
 * bash-gen.js - Base64 Einzeiler-Version
 */
const BashGenerator = {
    generateConfig() {
        let configParts = UI.blocks.map(b => b.content);
        const userShares = this.getVirtualUserShares();
        return (configParts.join('\n').trim() + "\n" + userShares).trim();
    },

    getVirtualUserShares() {
        const rows = document.querySelectorAll('#accTable tbody tr');
        let virtualContent = "";
        rows.forEach(row => {
            const userCell = row.cells[1].querySelector('input');
            const toggle = row.querySelector('.share-toggle');
            const limitInput = row.querySelector('.share-limit');
            if (userCell && toggle && toggle.checked) {
                const userName = userCell.value.trim();
                const limit = limitInput.value || "50";
                if (userName) {
                    virtualContent += `\n[/u/${userName}]\n  res: /mnt/storage/pub/${userName}\n  accs:\n    rwdm: ${userName}, @admin\n  flags:\n    av\n    dedup\n  vmaxb: ${limit}G\n`;
                }
            }
        });
        return virtualContent;
    },

    generateFullScript(configContent) {
        // Die mkdir-Befehle sammeln
        let mkdirs = "";
        const rows = document.querySelectorAll('#accTable tbody tr');
        rows.forEach(row => {
            const toggle = row.querySelector('.share-toggle');
            if (toggle && toggle.checked) {
                const user = row.cells[1].querySelector('input').value.trim();
                if (user) mkdirs += `mkdir -p /mnt/storage/pub/${user}; `;
            }
        });

        // Die Config in Base64 umwandeln (UTF-8 sicher)
        const b64Config = btoa(unescape(encodeURIComponent(configContent)));

        // Der kompakte Einzeiler
        // 1. Backup -> 2. Verzeichnisse -> 3. Config schreiben -> 4. Restart
        return `cp copyparty.conf copyparty.conf.bak_$(date +%s); ${mkdirs} echo "${b64Config}" | base64 -d > copyparty.conf; sudo systemctl restart copyparty && echo "Update erfolgreich!"`;
    }
};
