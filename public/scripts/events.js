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
      // tee täiesti vaikne unlock ja JÄTA see vaikseks kuni päris võiduni
      winnerSound.muted = true;
      winnerSound.volume = 0;
      await winnerSound.play();        // user-gesture (iOS)
      winnerSound.pause();
      winnerSound.currentTime = 0;
      // NB! ära taasta siin muted/volume — hoiame täielikult vait kuni võiduni
    } catch (_) { /* ignore */ }

    // eemalda kuulajad kõigilt targetitelt
    targets.forEach(el => {
      el.removeEventListener('pointerdown', unlock);
      el.removeEventListener('touchend', unlock);
    });
  };

  // seo ainult spin-piirkonna elementidele
  targets.forEach(el => {
    el.addEventListener('pointerdown', unlock, { once: true });
    el.addEventListener('touchend', unlock, { once: true });
  });
})();

/* ✅ MÄNGI HELI AINULT RATTA VÕIDU KORRAL JA SISSELOGITUNA */
(function wireWinnerSoundToWheelOnly() {
  const playWin = () => {
    if (!auth || !auth.currentUser) return;   // ⛔ ilma loginita ei mängi
    try {
      // Lülita heli kuuldavaks alles nüüd, kui tulemus käes
      winnerSound.muted = false;
      winnerSound.volume = 1;

      winnerSound.currentTime = 0;
      const p = winnerSound.play();
      if (p && typeof p.catch === 'function') p.catch(() => { });
    } catch (_) { /* ohutu ignore */ }
  };

  // säilita eelnev onWheelResult kui see olemas
  const prev = window.onWheelResult;
  window.onWheelResult = (payload) => {
    try { if (typeof prev === 'function') prev(payload); } catch (_) { }

    // ✅ heli ainult siis, kui päriselt võitja olemas ja kasutaja sees
    if (payload && payload.id && auth.currentUser) {
      playWin();
    }
  };
})();

/* 1) Nupp ise — jääb muutmata (näitab login-modaali, kui pole sisse logitud) */
spinBtn?.addEventListener('click', handleSpinIntent);

/* 2) Klõps kanvasele või rootorile (“ratta keskele”)
      ⛔ Välja logituna EI tee midagi (ei ava loginit), sisse logituna alustab spinni */
wheelEl?.addEventListener('click', (e) => {
  if (!auth.currentUser) return;        // ära ava login akent ratta klikil
  handleSpinIntent(e);
});

rotorEl?.addEventListener('click', (e) => {
  if (e.target === spinBtn) return;     // vältida topeltkutsumist
  if (!auth.currentUser) return;        // ära ava login akent ratta klikil
  handleSpinIntent(e);
});

/* 3) (valikuline) telje ümbrise klikk — sama loogika */
axleEl?.addEventListener('click', (e) => {
  if (e.target === spinBtn) return;
  if (!auth.currentUser) return;        // ära ava login akent ratta klikil
  handleSpinIntent(e);
});

/* --- sinu ülejäänud events.js (dialogide avamine/sulgemine, showPane jne) --- */

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
    dlg.querySelectorAll('.auth-pane')
      .forEach(p => p.classList.toggle('hidden', p.dataset.pane !== which));
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

    // 🚫 kui logid välja, siis peatame heli
    try { winnerSound.pause(); winnerSound.currentTime = 0; } catch (_) { }
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await signOut(auth);
});
