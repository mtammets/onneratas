/* ──────────────────────────────────────────────────────────────────────────────
  Stop → modal + konfeti + ajalugu (võit = värv)
────────────────────────────────────────────────────────────────────────────── */
/* ──────────────────────────────────────────────────────────────
   Stop → konfeti + ajalugu + rahakott + esiletõst
────────────────────────────────────────────────────────────── */
function onStop(win) {
    const label = win?.label || 'Võit';
    const color = win?.color || '#ffd28a';

    blastConfetti();

    // (jätame olemasoleva auhinnainfo uuenduse – kui näitad Prize modali mujal)
    prizeEmoji && (prizeEmoji.textContent = '');
    prizeText.textContent = label;
    prizeNote.textContent = `Värv: ${color}`;
    const titleEl = document.getElementById('prizeTitle');
    if (titleEl) titleEl.textContent = 'Palju õnne!';

    // Ajalukku
    addHistory({ label, color });
    if (typeof renderHistory === 'function') renderHistory();

    // Rahakotti → loo püsiv id + ajatempel (vajalik hilisemaks esiletõstuks)
    const t = Date.now();
    const id = 'w_' + t;
    addToWallet({ id, t, label, color });
    updateWalletBadge?.();

    // Ava & tõsta värske võit esile
    renderWallet?.();
    walletModal?.showModal?.();
    // lase DOM-il joonistuda ja tõsta siis esile
    setTimeout(() => { typeof highlightWalletItem === 'function' && highlightWalletItem(id); }, 0);
}





/* Tee kindlaks, et kui rahakoti dialoog avatakse, on nupud ka siis korras */
document.addEventListener('DOMContentLoaded', () => {
    const walletBtn = document.getElementById('walletBtn');
    const walletModal = document.getElementById('walletModal');
    if (walletBtn && walletModal) {
        walletBtn.addEventListener('click', () => {
            // enne avamist värskenda list + stiilid
            if (typeof renderWallet === 'function') renderWallet();
            walletModal.showModal();
            setTimeout(styleWalletButtons, 0);
        });
    }
});
