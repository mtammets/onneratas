/* ──────────────────────────────────────────────────────────────────────────────
  Konfeti
────────────────────────────────────────────────────────────────────────────── */
let confettiPieces = [];

function blastConfetti() {
    // 🔔 anna märku, et konfeti algas
    document.dispatchEvent(new CustomEvent('confetti:start'));

    const dpr = devicePixelRatio || 1;

    confetti.width = innerWidth * dpr;
    confetti.height = innerHeight * dpr;
    confetti.style.width = '100%';
    confetti.style.height = '100%';

    confettiPieces = [];
    for (let i = 0; i < 140; i++) {
        confettiPieces.push({
            x: Math.random() * confetti.width,
            y: -20,
            vy: 2 + Math.random() * 3,
            vx: -1 + Math.random() * 2,
            s: 4 + Math.random() * 8,
            r: Math.random() * Math.PI,
            dr: -0.1 + Math.random() * 0.2,
            color: ['#ffd28a', '#ff8a3a', '#8dd6ff', '#ffa1d1', '#9cffd1', '#fff'][i % 6]
        });
    }
    requestAnimationFrame(confettiFrame);
}

function confettiFrame() {
    cfx.clearRect(0, 0, confetti.width, confetti.height);

    confettiPieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.dr;

        cfx.save();
        cfx.translate(p.x, p.y);
        cfx.rotate(p.r);
        cfx.fillStyle = p.color;
        cfx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        cfx.restore();
    });

    confettiPieces = confettiPieces.filter(p => p.y < confetti.height + 40);
    if (confettiPieces.length) requestAnimationFrame(confettiFrame);
}
