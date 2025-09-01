/* ──────────────────────────────────────────────────────────────────────────────
  DOM viited
────────────────────────────────────────────────────────────────────────────── */
const rotor = document.getElementById('rotor');
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const bulbsEl = document.getElementById('bulbs');

const spinBtn = document.getElementById('spinBtn');
const freeSpinTag = document.getElementById('freeSpinTag');

const prizeModal = document.getElementById('prizeModal');
const prizeText = document.getElementById('prizeText');
const prizeEmoji = document.getElementById('prizeEmoji');
const prizeNote = document.getElementById('prizeNote');

const historyEl = document.getElementById('history');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');

const infoDlg = document.getElementById('info');
const infoBtn = document.getElementById('infoBtn');

const confetti = document.getElementById('confetti');
const cfx = confetti.getContext('2d');

const devResetBtn = document.getElementById('devResetBtn');

/* Keerutuste info (meter) */
const spinsLeftEl = document.getElementById('spinsLeft');
const spinsMaxEl = document.getElementById('spinsMax');
const nextFreeInfo = document.getElementById('nextFreeInfo');
const freeDot = document.getElementById('freeDot');
const freeSub = document.getElementById('freeSub');

// Rahakoti UI
const walletBtn = document.getElementById('walletBtn');
const walletBadge = document.getElementById('walletBadge');
const walletModal = document.getElementById('walletModal');
const walletList = document.getElementById('walletList');
const walletEmpty = document.getElementById('walletEmpty');
const walletWithdrawAll = document.getElementById('walletWithdrawAll');
