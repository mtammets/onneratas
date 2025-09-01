/* ──────────────────────────────────────────────────────────────────────────────
  Aja abifunktsioonid (loenduri jaoks)
────────────────────────────────────────────────────────────────────────────── */
function msToMidnight() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next - now;
}

function formatHMS(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = Math.floor(s / 3600).toString().padStart(2, '0');
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}
