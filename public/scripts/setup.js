/* ──────────────────────────────────────────────────────────────────────────────
  Initsialiseeri
────────────────────────────────────────────────────────────────────────────── */
function setup() {
    layoutBulbs();
    drawStaticWheel();

    freeSpinTag.hidden = !hasFreeSpin();
    updateMeter();

    // algasend – pointer ülal
    rotor.style.transform = 'rotate(-90deg)';
}
setup();


// --- TASUTA märgi automaatne näitamine/peitmine -----------------
(function () {
    const tag = document.getElementById('freeSpinTag');
    const left = document.getElementById('spinsLeft');
    const rotor = document.getElementById('rotor');

    if (!tag || !left) return;

    const updateFreeTag = () => {
        const n = Number((left.textContent || '0').trim()) || 0;
        tag.hidden = !(n > 0);
    };

    // 1) alglaadimisel
    updateFreeTag();

    // 2) kui UI loendur muutub (nt pärast tasuta kasutamist)
    const mo = new MutationObserver(updateFreeTag);
    mo.observe(left, { characterData: true, childList: true, subtree: true });

    // 3) kohe pärast ratta peatumist (CSS transformi üleminek lõppeb)
    rotor?.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform') updateFreeTag();
    });

    // 4) turvalisuse mõttes ka peale nupu klikki (juhtudel kui üleminek puudub)
    document.getElementById('spinBtn')?.addEventListener('click', () => {
        // väike viide: värskenda, kui spin-tsükkel on lõpetatud (fallback)
        setTimeout(updateFreeTag, 800); // vajadusel kohanda
    });
})();

