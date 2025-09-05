/* Konstandid */
const STORAGE_KEYS = {
  PRIZES: 'wheel_prizes',      // ühilduvuse pärast
  HISTORY: 'wheel_history',
  LAST_FREE: 'wheel_last_free',
  WALLET: 'wheel_wallet'
};

/* Me nüüd värvidega mäng – vana jätame tühjaks ühilduvuseks */
const DEFAULT_PRIZES = [];

/** Ratta viilud = värvid (nimi = label) */
const WHEEL_SLICES = [
  { color: '#ffcf33', label: 'Kuldne' },
  { color: '#7ee081', label: 'Roheline' },
  { color: '#8dd6ff', label: 'Helesinine' },
  { color: '#f7a27b', label: 'Oranž' },
  { color: '#9cffd1', label: 'Mündiroheline' },
  { color: '#ffa1d1', label: 'Roosa' },
  { color: '#a3b0d0', label: 'Hall' },
  { color: '#ffd28a', label: 'Kollane' }
];

/* Config */
const SECTOR_CONFIG_BY_ID = {
  "sec-1": { color: "#ffd166", icon: "fa-crown", name: "MASSAAŽ" },
  "sec-2": { color: "#62d394", icon: "fa-leaf", name: "SOENG" },
  "sec-3": { color: "#ffa366", icon: "fa-mug-hot", name: "PEAMASSAAŽ" },
  "sec-4": { color: "#9cd7ff", icon: "fa-gem", name: "MUINASJUTT" },
  "sec-5": { color: "#a881e6", icon: "fa-star", name: "ÕLAMASSAAŽ" },
  "sec-6": { color: "#5aa7f9", icon: "fa-utensils", name: "ÕHTUSÖÖK" },
  "sec-7": { color: "#f7a1c0", icon: "fa-heart", name: "SOOV" },
  "sec-8": { color: "#c9cbd1", icon: "fa-moon", name: "JALAMASSAAŽ" }
};

const DEFAULT_SECTOR_STYLE = { color: "#ffd28a", icon: "fa-gift" };

/* Tasuta keerutused + animatsioon */
const FREE_SPINS_PER_DAY = 1;
const SPIN_TURNS_BASE = 6.5;
const SPIN_TURNS_RANDOM = 6.5;
const SPIN_MS_BASE = 10500;
const SPIN_MS_JITTER = 1200;
const TAU = Math.PI * 2;

/* Iga tabamus on päris võit */
function isRealWin(_) { return true; }

/* Ekspordi globaali (mitte-module skriptid vajavad) */
window.STORAGE_KEYS = STORAGE_KEYS;
window.DEFAULT_PRIZES = DEFAULT_PRIZES;
window.WHEEL_SLICES = WHEEL_SLICES;
window.FREE_SPINS_PER_DAY = FREE_SPINS_PER_DAY;
window.SPIN_TURNS_BASE = SPIN_TURNS_BASE;
window.SPIN_TURNS_RANDOM = SPIN_TURNS_RANDOM;
window.SPIN_MS_BASE = SPIN_MS_BASE;
window.SPIN_MS_JITTER = SPIN_MS_JITTER;
window.TAU = TAU;
window.isRealWin = isRealWin;


/* Võidusektori → GIF kaardistus */
const SECTOR_GIF_BY_ID = {
  'sec-1': 'gifs/1.gif',     // kroon
  'sec-2': 'gifs/2.gif',      // leaf
  'sec-3': 'gifs/3.gif',    // kohv
  'sec-4': 'gifs/4.gif',   // shoppamine/“gem”
  'sec-5': 'gifs/5.gif',      // filmiõhtu/“star”
  'sec-6': 'gifs/6.gif',      // õhtusöök
  'sec-7': 'gifs/7.gif',     // soov/“heart”
  'sec-8': 'gifs/8.gif'       // jalutuskäik/“moon”
};
window.SECTOR_GIF_BY_ID = SECTOR_GIF_BY_ID;
