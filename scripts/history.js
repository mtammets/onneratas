/* ──────────────────────────────────────────────────────────────────────────────
  Ajalugu (render)
────────────────────────────────────────────────────────────────────────────── */
function renderHistory() {
  const list = getHistory();
  historyEl.innerHTML = '';
  for (const r of list) {
    const row = document.createElement('div');
    row.className = 'row';

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = r.color || '#ffd28a';

    const lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = r.label;   // ← ainult tekst, ilma emoji-ta

    const time = document.createElement('div');
    time.className = 'small muted';
    time.textContent = new Date(r.t).toLocaleString();

    row.append(dot, lbl, time);
    historyEl.appendChild(row);
  }
}
