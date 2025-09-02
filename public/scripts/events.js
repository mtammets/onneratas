

import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/* ──────────────────────────────────────────────────────────────
   Events: User Interaction (Spin Button & Spin Again)
────────────────────────────────────────────────────────────── */

/**
 * Main Spin Button
 * - Triggered when the user clicks the big "SPIN" button.
 * - Starts the spin only if the wheel is currently idle.
 */
spinBtn?.addEventListener("click", () => {
  if (!spinning) {
    spin?.();
  }
});

// Üldine avamine/sulgemine data-attribuutidega
document.querySelectorAll("[data-open-dialog]").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-open-dialog");
    document.getElementById(id)?.showModal();
  });
});
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-close-dialog]");
  if (btn) document.getElementById(btn.getAttribute("data-close-dialog"))?.close();
});
(function () {
  const dlg = document.getElementById('loginModal');
  if (!dlg) return;

  function showPane(which) {
    dlg.querySelectorAll('.auth-pane')
      .forEach(p => p.classList.toggle('hidden', p.dataset.pane !== which));
    const h = dlg.querySelector('header h3');
    if (h) h.textContent = which === 'signup' ? 'Loo konto' : 'Logi sisse';
  }

  // lingid vahetamiseks
  dlg.querySelector('#toSignupLink')?.addEventListener('click', e => { e.preventDefault(); showPane('signup'); });
  dlg.querySelector('#toLoginLink')?.addEventListener('click', e => { e.preventDefault(); showPane('login'); });

  // (jääb alles sinu parooli-silmad, valideerimised jne)
  dlg.addEventListener('close', () => showPane('login')); // alati tagasi loginile
  showPane('login');
})();




onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Kasutaja sees:", user.email);
    document.body.classList.add("logged-in");
  } else {
    console.log("Keegi pole sees");
    document.body.classList.remove("logged-in");
  }
});

// Näide logout nupu jaoks
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
});







//screensaver

