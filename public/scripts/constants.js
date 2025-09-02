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

/* Tasuta keerutused + animatsioon */
const FREE_SPINS_PER_DAY = 50;
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
