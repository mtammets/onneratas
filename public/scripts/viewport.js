/* ──────────────────────────────────────────────────────────────────────────────
  Viewport kõrguse fix (mobiili aadressiriba jms)
────────────────────────────────────────────────────────────────────────────── */
function setVH() {
    const h = Math.max(innerHeight, 560);
    document.documentElement.style.setProperty('--vh', `${h}px`);
}
setVH();
addEventListener('resize', setVH);
