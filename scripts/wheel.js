/* ──────────────────────────────────────────────────────────────────────────────
  Ratta joonistamine (staatiline canvas)
  - Kui on aktiveeritud tasuta keerutus → lisakuma/neoonrim + CSS glow
────────────────────────────────────────────────────────────────────────────── */
function drawStaticWheel() {
    const dpr = devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const side = Math.min(rect.width, rect.height);
    const px = Math.max(240, side) * dpr;

    canvas.width = px;
    canvas.height = px;

    const cx = px / 2;
    const cy = px / 2;
    const r = Math.min(cx, cy) * 0.92;

    const isActive =
        typeof window.isFreeSpinArmed === 'function' && window.isFreeSpinArmed();

    // ⇨ Sünkroniseeri ka CSS glow klassid (välised efektid .wheel-wrap ja .pointer'ile)
    document.querySelector('.wheel-wrap')?.classList.toggle('wheel-active', isActive);
    document.querySelector('.pointer')?.classList.toggle('wheel-active', isActive);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, px, px);
    ctx.translate(cx, cy);

    // Kasuta ainult WHEEL_SLICES
    const slices = WHEEL_SLICES;
    const n = slices.length;
    const TAU = (typeof window !== 'undefined' && window.TAU) ? window.TAU : Math.PI * 2;
    const step = TAU / n;

    // Viilud
    for (let i = 0; i < n; i++) {
        const a0 = i * step;
        const a1 = a0 + step;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, a0, a1);
        ctx.closePath();

        const col = slices[i].color || '#ffd28a';
        const grd = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
        grd.addColorStop(0, shade(col, 40));
        grd.addColorStop(0.6, col);
        grd.addColorStop(1, shade(col, -25));

        ctx.fillStyle = grd;
        ctx.strokeStyle = 'rgba(255,255,255,.18)';
        ctx.lineWidth = r * 0.014;
        ctx.fill();
        ctx.stroke();
    }

    // Keskne rõngas
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.56, 0, TAU);
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = r * 0.04;
    ctx.stroke();

    /* ── Aktiivne aura: lisakuma + neoonserv + vignet ───────────── */
    if (isActive) {
        ctx.save();

        // 1) Sisemine kuldne halo (õrn)
        let halo = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.95);
        halo.addColorStop(0.0, 'rgba(255,207,51,0.22)');
        halo.addColorStop(0.35, 'rgba(255,207,51,0.10)');
        halo.addColorStop(1.0, 'rgba(255,207,51,0.00)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, TAU);
        ctx.fill();

        // 2) Neooni välisrim (lighter compositing annab sära)
        ctx.globalCompositeOperation = 'lighter';
        const rimR = r * 1.01;
        for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.arc(0, 0, rimR - k * (r * 0.01), 0, TAU);
            const alpha = [0.35, 0.22, 0.12][k];
            ctx.strokeStyle = `rgba(255,210,138,${alpha})`;
            ctx.lineWidth = r * (0.020 - k * 0.005);
            ctx.stroke();
        }

        // 3) Pehme vignet, et keskosa “hõõguks” ja servad tumeneksid
        ctx.globalCompositeOperation = 'source-over';
        const vign = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r * 1.02);
        vign.addColorStop(0.0, 'rgba(0,0,0,0.00)');
        vign.addColorStop(0.7, 'rgba(0,0,0,0.00)');
        vign.addColorStop(1.0, 'rgba(0,0,0,0.28)');
        ctx.fillStyle = vign;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.02, 0, TAU);
        ctx.fill();

        ctx.restore();
    }
}

function shade(hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 255) + amt;
    let b = (num & 255) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
