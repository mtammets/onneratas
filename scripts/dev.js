/* ──────────────────────────────────────────────────────────────────────────────
  DEV: nulli ajalugu ja tasuta
────────────────────────────────────────────────────────────────────────────── */
function devResetHistoryAndFree() {
    // puhasta ajalugu
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    // tee tasuta keerutused uuesti kättesaadavaks (kustutame loenduri)
    localStorage.removeItem(STORAGE_KEYS.LAST_FREE);

    // UI värskendus
    renderHistory();
    updateMeter();
    freeSpinTag.hidden = !hasFreeSpin();
    if (spinBtn) spinBtn.disabled = !hasFreeSpin();

    try { navigator.vibrate && navigator.vibrate(40); } catch { /* ignore */ }
    alert('Ajalugu nullitud ja tasuta keerutused taastatud.');
}

if (devResetBtn) {
    devResetBtn.addEventListener('click', devResetHistoryAndFree);
}
