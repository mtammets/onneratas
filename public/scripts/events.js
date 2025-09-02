import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/* Haara elemendid (module-scope) */
const spinBtn = document.getElementById('spinBtn');
const wheelEl = document.getElementById('wheel');   // <canvas>
const rotorEl = document.getElementById('rotor');   // ratta wrapper
const axleEl = document.querySelector('.axle');     // nupu ümbris
const loginDlg = document.getElementById('loginModal');

function handleSpinIntent(e) {
  if (!auth.currentUser) {
    e?.preventDefault?.();
    loginDlg?.showModal();
    return;
  }
  if (!spinning) {
    spin?.();
  }
}

/* ——— Kesk-GIF utiliidid ——— */
function ensureCenterGifEl() {
  let el = document.getElementById('centerGif');
  if (!el && axleEl) {
    axleEl.style.position = axleEl.style.position || 'relative';
    el = document.createElement('img');
    el.id = 'centerGif';
    el.alt = 'Võidupilt';
    el.className = 'center-gif';
    el.decoding = 'async';
    axleEl.appendChild(el);
  }
  return el;
}
function getGifForSector(id) {
  // eelistame globaalset kaardistust, kuid pane vaikimisi failid kui seda pole
  const map = (window.SECTOR_GIF_BY_ID) || {
    'sec-1': 'gifs/crown.gif',
    'sec-2': 'gifs/leaf.gif',
    'sec-3': 'gifs/coffee.gif',
    'sec-4': 'gifs/diamond.gif',
    'sec-5': 'gifs/star.gif',
    'sec-6': 'gifs/food.gif',
    'sec-7': 'gifs/heart.gif',
    'sec-8': 'gifs/moon.gif'
  };
  return map[id] || '';
}

// ——— Võiduheli (iOS unlock) ———
const winnerSound = new Audio('sounds/winner.mp3');
winnerSound.preload = 'auto';

/* iOS: luba heli pärast ESIMEST kasutaja puudutust
   — ainult spinniga seotud elementidel, mitte window'il */
(function unlockAudioOnSpinElements() {
  const targets = [spinBtn, wheelEl, rotorEl, axleEl].filter(Boolean);
  if (!targets.length) return;

  const unlock = async () => {
    try {
      // täiesti vaikne unlock ja jätame heli vaikseks kuni päris võiduni
      winnerSound.muted = true;
      winnerSound.volume = 0;
      await winnerSound.play();
      winnerSound.pause();
      winnerSound.currentTime = 0;
    } catch (_) { /* ignore */ }

    targets.forEach(el => {
      el.removeEventListener('pointerdown', unlock);
      el.removeEventListener('touchend', unlock);
    });
  };

  targets.forEach(el => {
    el.addEventListener('pointerdown', unlock, { once: true });
    el.addEventListener('touchend', unlock, { once: true });
  });
})();

/* ✅ MÄNGI HELI AINULT RATTA VÕIDU KORRAL JA SISSELOGITUNA
     + näita vastava sektori GIF-i ratta keskel */
(function wireWinnerSoundToWheelOnly() {
  const playWin = () => {
    if (!auth || !auth.currentUser) return;
    try {
      winnerSound.muted = false;
      winnerSound.volume = 1;
      winnerSound.currentTime = 0;
      const p = winnerSound.play();
      if (p && typeof p.catch === 'function') p.catch(() => { });
    } catch (_) { /* ignore */ }
  };

  const prev = window.onWheelResult;
  window.onWheelResult = (payload) => {
    try { if (typeof prev === 'function') prev(payload); } catch (_) { }

    if (payload && payload.id && auth.currentUser) {
      // 1) heli
      playWin();

      // 2) kesk-GIF
      const src = getGifForSector(payload.id);
      const img = ensureCenterGifEl();
      if (img && src) {
        img.src = src;
        const wrap = document.querySelector('.wheel-wrap');
        wrap?.classList.add('show-gif');  // CSS teeb GIF-i nähtavaks
      }
    }
  };
})();

/* 1) Nupp ise — jääb muutmata (näitab login-modaali, kui pole sisse logitud) */
spinBtn?.addEventListener('click', handleSpinIntent);

/* 2) Klõps kanvasele või rootorile — välja logituna ei ava loginit */
wheelEl?.addEventListener('click', (e) => {
  if (!auth.currentUser) return;
  handleSpinIntent(e);
});
rotorEl?.addEventListener('click', (e) => {
  if (e.target === spinBtn) return;
  if (!auth.currentUser) return;
  handleSpinIntent(e);
});

/* 3) Telje ümbrise klikk — sama loogika */
axleEl?.addEventListener('click', (e) => {
  if (e.target === spinBtn) return;
  if (!auth.currentUser) return;
  handleSpinIntent(e);
});

/* --- muud dialoogi/vaate kuulajad --- */
document.querySelectorAll('[data-open-dialog]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-open-dialog');
    document.getElementById(id)?.showModal();
  });
});
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-close-dialog]');
  if (btn) document.getElementById(btn.getAttribute('data-close-dialog'))?.close();
});
(function () {
  const dlg = loginDlg;
  if (!dlg) return;
  function showPane(which) {
    dlg.querySelectorAll('.auth-pane').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== which));
    const h = dlg.querySelector('header h3');
    if (h) h.textContent = which === 'signup' ? 'Loo konto' : 'Logi sisse';
  }
  dlg.querySelector('#toSignupLink')?.addEventListener('click', e => { e.preventDefault(); showPane('signup'); });
  dlg.querySelector('#toLoginLink')?.addEventListener('click', e => { e.preventDefault(); showPane('login'); });
  dlg.addEventListener('close', () => showPane('login'));
  showPane('login');
})();

onAuthStateChanged(auth, (user) => {
  const loggedOutImage = document.getElementById('loggedOutImage');

  if (user) {
    document.body.classList.add('logged-in');
    if (loggedOutImage) loggedOutImage.style.display = 'none';
  } else {
    document.body.classList.remove('logged-in');
    if (loggedOutImage) loggedOutImage.style.display = 'block';
    try { winnerSound.pause(); winnerSound.currentTime = 0; } catch (_) { }
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await signOut(auth);
});
