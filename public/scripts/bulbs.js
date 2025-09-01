/* ──────────────────────────────────────────────────────────────────────────────
  Pirnide paigutus
────────────────────────────────────────────────────────────────────────────── */
let lights = [];

function layoutBulbs() {
  bulbsEl.innerHTML = '';
  const N = 36;
  for (let i = 0; i < N; i++) {
    const li = document.createElement('li');
    const ang = (i / N) * TAU;
    const r = 48;
    li.style.left = `${50 + Math.cos(ang) * r}%`;
    li.style.top = `${50 + Math.sin(ang) * r}%`;
    li.style.setProperty('--delay', `${(i % 6) * 0.15}s`);
    bulbsEl.appendChild(li);
  }
  lights = [...bulbsEl.children];
}
