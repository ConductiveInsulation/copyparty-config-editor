/**
 * bash-gen.js - Generiert das Update Script
 */
const BashGenerator = {
    generateConfig() {
        // Holt die aktuellen Inhalte aus UI.blocks
        if (!UI || !UI.blocks) return "";
        return UI.blocks.map(b => b.content).join('\n\n');
    },

    generateFullScript(configContent) {
        // Sicherheits-Encoding für die Config Datei
        const b64Config = btoa(unescape(encodeURIComponent(configContent)));
        
        // Das finale Install-Script
        // 1. Backup mit Timestamp
        // 2. Decode der neuen Config
        // 3. Restart des Services
        // 4. Statusmeldung
        
        return `
# Copyparty Update Script
# Generiert vom Config Editor

# 1. Backup erstellen
cp copyparty.conf copyparty.conf.bak_$(date +%s)

# 2. Neue Config schreiben
echo "${b64Config}" | base64 -d > copyparty.conf

# 3. Service neustarten
sudo systemctl restart copyparty

# 4. Prüfen
if systemctl is-active --quiet copyparty; then
  echo "✅ Copyparty erfolgreich aktualisiert und läuft!"
else
  echo "❌ Fehler: Service läuft nicht. Prüfe 'journalctl -u copyparty'"
fi
`.trim();
    }
};
