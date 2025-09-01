/* ──────────────────────────────────────────────────────────────────────────────
  Persistents: auhinnad, ajalugu, tasuta keerutused
────────────────────────────────────────────────────────────────────────────── */
let PRIZES = loadPrizes();

function loadPrizes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
        return raw ? JSON.parse(raw) : DEFAULT_PRIZES;
    } catch {
        return DEFAULT_PRIZES;
    }
}

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
    } catch {
        return [];
    }
}

function addHistory(item) {
    const list = getHistory();
    list.unshift({ ...item, t: Date.now() });
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0, 60)));
}

/** Uus salvestusvorming: { date: "Mon Sep 01 2025", used: number } */
function getFreeData() {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_FREE);
    if (!raw) return {};
    try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') return obj;
    } catch {
        // Ühilduvus vana string-formaadiga (ainult kuupäev)
        const today = new Date().toDateString();
        if (raw === today) return { date: today, used: FREE_SPINS_PER_DAY }; // loeme “täis”
    }
    return {};
}

function setFreeData(data) {
    localStorage.setItem(STORAGE_KEYS.LAST_FREE, JSON.stringify(data));
}

function spinsLeftToday() {
    const today = new Date().toDateString();
    const data = getFreeData();
    if (data.date !== today) return FREE_SPINS_PER_DAY;
    const used = Number(data.used || 0);
    return Math.max(0, FREE_SPINS_PER_DAY - used);
}

function hasFreeSpin() {
    return spinsLeftToday() > 0;
}

function consumeFreeSpin() {
    const today = new Date().toDateString();
    const data = getFreeData();
    if (data.date !== today) setFreeData({ date: today, used: 1 });
    else setFreeData({ date: today, used: Number(data.used || 0) + 1 });
}


/* ──────────────────────────────────────────────────────────────────────────────
  Võitude “rahakott”
────────────────────────────────────────────────────────────────────────────── */
function getWallet() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLET)) || [];
    } catch {
        return [];
    }
}
function setWallet(list) {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(list));
}
function addToWallet(item) {
    const list = getWallet();
    const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    list.unshift({ id, t: Date.now(), ...item }); // hoia värskeim üleval
    setWallet(list);
    return id;
}
function removeFromWallet(id) {
    const list = getWallet();
    const idx = list.findIndex(x => x.id === id);
    if (idx >= 0) {
        const [removed] = list.splice(idx, 1);
        setWallet(list);
        return removed;
    }
    return null;
}
function clearWallet() {
    const list = getWallet();
    setWallet([]);
    return list;
}
