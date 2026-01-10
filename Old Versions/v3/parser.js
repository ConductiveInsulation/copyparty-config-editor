/**
 * parser.js - Zerlegt die Config in Blöcke
 */
const ConfigParser = {
    parse(rawText) {
        const regex = /^\[/gm;
        let match, indices = [];
        while ((match = regex.exec(rawText)) !== null) indices.push(match.index);

        return indices.map((start, i) => {
            const end = (i + 1 < indices.length) ? indices[i + 1] : rawText.length;
            const content = rawText.substring(start, end).trim();
            const type = this.determineType(content);
            
            // Titel extrahieren (zwischen [ ])
            let title = content.match(/^\[(.*?)\]/)?.[1] || "unknown";

            return {
                order: (i + 1) * 10,
                content: content,
                type: type,
                title: title
            };
        });
    },

    determineType(text) {
        if (text.startsWith('[global]')) return 'global';
        if (text.startsWith('[accounts]')) return 'accounts';
        if (text.startsWith('[groups]')) return 'groups';
        if (text.startsWith('[/')) return 'share';
        return 'other';
    }
};
