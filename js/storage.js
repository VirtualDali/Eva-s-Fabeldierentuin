/* ============================================
   Storage - localStorage save/load
   ============================================ */

const Storage = {
    SAVE_KEY: 'evas-fabeldierentuin-v2',

    saveGame(data) {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Opslaan mislukt:', e);
        }
    },

    loadGame() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('Laden mislukt:', e);
            return null;
        }
    },

    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    resetGame() {
        localStorage.removeItem(this.SAVE_KEY);
    }
};
