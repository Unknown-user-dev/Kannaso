const KannasoError = require('../constants/KannasoError.js');
const SearchTypes = { 'soundcloud': 'scsearch', 'youtube': 'ytsearch', 'youtubemusic': 'ytmsearch' };

class KannasoUtil {
    static getVersion() {
        try {
            const { version } = require('discord.js-light');
            return { variant: 'light', version };
        } catch (error) {
            try {
                const { version } = require('discord.js');
                return { variant: 'vanilla', version };
            } catch (error) {
                throw new Error('Cannot load discord.js / discord.js-light from your project, are you sure any of those are installed?');
            }
        }
    }

    static mergeDefault(def, given) {
        if (!given) return def;
        const defaultKeys = Object.keys(def);
        for (const key of defaultKeys) {
            if (def[key] === null) {
                if (!given[key]) throw new KannasoError(`${key} was not found from the given options.`);
            }
            if (given[key] === null || given[key] === undefined) given[key] = def[key];
        }
        for (const key in defaultKeys) {
            if (defaultKeys.includes(key)) continue;
            delete given[key];
        }
        return given;
    }

    static searchType(string) {
        const result = SearchTypes[string];
        if (!result) throw new KannasoError('This search type is not supported');
        return result;
    }

    static websocketSend(ws, payload) {
        return new Promise(resolve => ws.send(payload, () => resolve()));
    }

    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
module.exports = KannasoUtil;
