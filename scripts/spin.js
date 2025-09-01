/* ──────────────────────────────────────────────────────────────────────────────
  Keerutamine (#rotor CSS-rotate) – värvipõhine, realistliku tagasitõmbega
────────────────────────────────────────────────────────────────────────────── */
let angleDeg = -90;     // pointer ülal
let spinning = false;
let rafId = null;

/* vali juhuslik viil (võit = värv) */
function pickSlice() {
    const n = WHEEL_SLICES.length;
    const index = Math.floor(Math.random() * n);
    const slice = WHEEL_SLICES[index] || {};
    return {
        index,
        color: slice.color || '#ffd28a',
        label: slice.label || (slice.color || '#ffd28a')
    };
}

function cubicOut(t) {
    return 1 - Math.pow(1 - t, 3);
}
function easeInQuad(t) {
    return t * t;
}

/* Abi: kraadide normaliseerimine [0..360) */
function wrapDeg(deg) {
    return ((deg % 360) + 360) % 360;
}

function spin() {
    const isArmed = (typeof window.isFreeSpinArmed === 'function') ? window.isFreeSpinArmed() : false;
    if (spinning || !hasFreeSpin() || !isArmed) return;

    freeSpinTag.hidden = !hasFreeSpin();

    // ——— Värvipõhine siht ———
    const n = WHEEL_SLICES.length;
    const stepDeg = 360 / n;
    const win = pickSlice();          // { index, color, label }
    const idx = win.index;

    // siht: sektori keskpunkt pointeri alla (-90°)
    const sliceMidDeg = idx * stepDeg + stepDeg / 2;
    const desiredDeg = -90 - sliceMidDeg;

    // kineetika ettevalmistus
    angleDeg = wrapDeg(angleDeg);
    const desiredNorm = wrapDeg(desiredDeg);
    const forwardDiff = wrapDeg(desiredNorm - angleDeg);

    const k = SPIN_TURNS_BASE + Math.floor(Math.random() * (SPIN_TURNS_RANDOM + 1));
    const targetDeg = angleDeg + forwardDiff + k * 360;

    const duration = SPIN_MS_BASE + Math.random() * SPIN_MS_JITTER;
    const beginDeg = angleDeg;

    spinning = true;
    spinBtn.disabled = true;

    const tick = makeTickPlayer(n);

    // ── FAAS 1: väike tagasitõmme ──────────────────────────────
    const KICK_BACK_DEG = 22;
    const KICK_BACK_MS = 460;
    const KICK_SETTLE_MS = 220;

    function tween(from, to, ms, ease, onDone) {
        const start = performance.now();

        function step(now) {
            const t = Math.min(1, (now - start) / ms);

            // easing – kui antud, kasuta seda, muidu lineaarne
            const v = ease ? ease(t) : t;

            // nurk
            angleDeg = from + (to - from) * v;

            // väike realistlik “käe võbelus”
            const wobble = (1 - t) * Math.sin(t * Math.PI * 3) * 0.6;
            rotor.style.transform = `rotate(${angleDeg + wobble}deg)`;

            if (t < 1) {
                rafId = requestAnimationFrame(step);
            } else {
                onDone && onDone();
            }
        }

        rafId = requestAnimationFrame(step);
    }

    // 1.1 → natuke tagasi
    tween(beginDeg, beginDeg - KICK_BACK_DEG, KICK_BACK_MS, easeInQuad, () => {
        // 1.2 → pehmelt tagasi nulli
        tween(beginDeg - KICK_BACK_DEG, beginDeg, KICK_SETTLE_MS, cubicOut, () => {
            // ── FAAS 2: suur spinn ──────────────────────────────
            const start = performance.now();
            function frame(now) {
                const t = Math.min(1, (now - start) / duration);
                angleDeg = beginDeg + (targetDeg - beginDeg) * cubicOut(t);
                rotor.style.transform = `rotate(${angleDeg}deg)`;
                tick((angleDeg * Math.PI) / 180);

                if (t < 1) {
                    rafId = requestAnimationFrame(frame);
                } else {
                    spinning = false;

                    // kuluta tasuta keerutus
                    consumeFreeSpin();

                    // tühista aktiveering (glow maha, nupp lukku updateMeteri kaudu)
                    if (typeof window.disarmFreeSpin === 'function') window.disarmFreeSpin();

                    // UI sildid ja meetrid
                    freeSpinTag.hidden = !hasFreeSpin();
                    updateMeter();

                    const stillArmed = (typeof window.isFreeSpinArmed === 'function') ? window.isFreeSpinArmed() : false;
                    spinBtn.disabled = !stillArmed;

                    // LÕPP: anna edasi VÕIT (värv)
                    onStop(win);
                }
            }
            rafId = requestAnimationFrame(frame);
        });
    });
}
