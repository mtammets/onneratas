


/* ──────────────────────────────────────────────────────────────
   Wheel (canvas + icon overlay)
   - Console prints: "sec-X | #hex | Name"
   - Winner detection: rotation angle → exact sector
   - Icons stay upright (counter-rotate)
   - Winner sector focus (dim others + pulse glow)
────────────────────────────────────────────────────────────── */

/* Config */
const SECTOR_CONFIG_BY_ID = {
    "sec-1": { color: "#ffd166", icon: "fa-crown", name: "Crown" },
    "sec-2": { color: "#62d394", icon: "fa-leaf", name: "Leaf" },
    "sec-3": { color: "#ffa366", icon: "fa-fire", name: "Fire" },
    "sec-4": { color: "#9cd7ff", icon: "fa-gem", name: "Gem" },
    "sec-5": { color: "#a881e6", icon: "fa-star", name: "Star" },
    "sec-6": { color: "#5aa7f9", icon: "fa-ship", name: "Ship" },
    "sec-7": { color: "#f7a1c0", icon: "fa-heart", name: "Heart" },
    "sec-8": { color: "#c9cbd1", icon: "fa-cloud", name: "Cloud" }
};
const DEFAULT_SECTOR_STYLE = { color: "#ffd28a", icon: "fa-gift" };

/* Globaalid */
window.SECTOR_CONFIG_BY_ID = SECTOR_CONFIG_BY_ID;
window.DEFAULT_SECTOR_STYLE = DEFAULT_SECTOR_STYLE;

/* Ühine faas: ankur kell 12 (−90°) */
const PHASE = -Math.PI / 2;

/* Helpers */
function getSectors() {
    if (Array.isArray(window.WHEEL_SLICES)) return window.WHEEL_SLICES;
    if (Array.isArray(window.SECTORS)) return window.SECTORS;
    return Object.keys(SECTOR_CONFIG_BY_ID).map((id, i) => ({
        id,
        label: `Sector ${i + 1}`,
        color: SECTOR_CONFIG_BY_ID[id].color,
        icon: SECTOR_CONFIG_BY_ID[id].icon
    }));
}
function normalizeSectors() {
    const sectors = getSectors(); if (!sectors.length) return sectors;
    const ids = Object.keys(SECTOR_CONFIG_BY_ID);
    for (let i = 0; i < sectors.length; i++) {
        let s = sectors[i] || {};
        if (!s.id) s.id = ids[i % ids.length] || `sec-${i + 1}`;
        const conf = SECTOR_CONFIG_BY_ID[s.id] || DEFAULT_SECTOR_STYLE;
        if (!s.label) s.label = `Sector ${i + 1}`;
        s.color = conf.color; s.icon = conf.icon; sectors[i] = s;
    }
    return sectors;
}
function getCanvasCtx() {
    const canvas = document.getElementById("wheel");
    if (!canvas) return { canvas: null, ctx: null };
    return { canvas, ctx: canvas.getContext("2d") };
}

/* Rotation math */
function getRotationRadFromElement(el) {
    const tr = getComputedStyle(el).transform;
    if (!tr || tr === "none") return 0;
    const m = tr.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    const [a, b] = m[1].split(",").map(parseFloat);
    let ang = Math.atan2(b, a);
    if (ang < 0) ang += Math.PI * 2;
    return ang;
}
function resolveWinnerIndexByRotation(theta, sliceCount, phase = 0) {
    const TAU = Math.PI * 2, step = TAU / sliceCount;
    let phi = -Math.PI / 2 - theta - phase;          // pointer 12:00 – lahuta faas
    phi = ((phi % TAU) + TAU) % TAU;
    return Math.floor(phi / step);
}

/* Draw wheel (faasiga) */
function drawStaticWheel() {
    const { canvas, ctx } = getCanvasCtx(); if (!canvas || !ctx) return;
    const slices = normalizeSectors(); const n = slices.length; if (!n) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const side = Math.min(rect.width, rect.height || rect.width);
    const px = Math.max(240, side) * dpr;

    canvas.width = px; canvas.height = px;

    const cx = px / 2, cy = px / 2, r = Math.min(cx, cy) * 0.92;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, px, px);
    ctx.translate(cx, cy);

    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, PHASE + i * step, PHASE + (i + 1) * step);
        ctx.closePath();
        ctx.fillStyle = slices[i].color;
        ctx.strokeStyle = "rgba(255,255,255,.18)";
        ctx.lineWidth = r * 0.014;
        ctx.fill(); ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.56, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = r * 0.04;
    ctx.stroke();
}

/* Icon overlay (faasiga) */
function renderSectorIconsFromGlobals(slicesArg) {
    const rotor = document.getElementById("rotor"); if (!rotor) return;
    rotor.querySelector(".wheel-icons")?.remove();

    const slices = Array.isArray(slicesArg) ? slicesArg : normalizeSectors();
    const side = Math.min(rotor.clientWidth || 0, rotor.clientHeight || 0);
    if (!side || !slices.length) return;

    const step = (Math.PI * 2) / slices.length;
    const r = (side * 0.92 * 0.62) / 2;
    const baseSize = Math.max(16, Math.round(side * 0.085));

    const layer = document.createElement("div");
    layer.className = "wheel-icons";
    Object.assign(layer.style, { position: "absolute", inset: "0", pointerEvents: "none", zIndex: "3" });

    for (let i = 0; i < slices.length; i++) {
        const mid = PHASE + (i + 0.5) * step;
        const cx = side / 2 + Math.cos(mid) * r;
        const cy = side / 2 + Math.sin(mid) * r;

        const ico = document.createElement("i");
        ico.className = `fa-solid ${slices[i].icon}`;
        ico.dataset.id = slices[i].id;
        Object.assign(ico.style, {
            position: "absolute",
            left: `${cx}px`,
            top: `${cy}px`,
            transform: "translate(-50%,-50%) rotate(0deg)",  // upright – vasturotatsioon setitakse jooksvalt
            fontSize: `${baseSize}px`,
            color: "#eef2ff",
            textShadow: "0 1px 0 rgba(0,0,0,.35), 0 0 10px rgba(0,0,0,.25), 0 0 14px rgba(255,255,255,.08)",
            opacity: "0.95"
        });
        layer.appendChild(ico);
    }
    rotor.appendChild(layer);

    updateIconUpright();
}

/* Hoia ikoonid püstisena (vasturotatsioon rotorile) */
function updateIconUpright() {
    const rotor = document.getElementById("rotor"); if (!rotor) return;
    const theta = getRotationRadFromElement(rotor);   // rad
    const deg = -(theta * 180 / Math.PI);             // kraadides (vasturot.)

    document.querySelectorAll("#rotor .wheel-icons i").forEach(el => {
        // eemalda eelmine rotate, SÄILITA scale (highlight)
        const base = (el.style.transform || "");
        const withoutRotate = base.replace(/(?:\s*rotate\([^)]+\))/, "");
        el.style.transform = `${withoutRotate} rotate(${deg}deg)`.trim();
    });
}

/* Winner detection (faasiga) */
function findWinnerIdByAngle() {
    const rotor = document.getElementById("rotor");
    const slices = normalizeSectors(); if (!rotor || !slices.length) return null;
    const theta = getRotationRadFromElement(rotor);
    const idx = resolveWinnerIndexByRotation(theta, slices.length, PHASE);
    return slices[idx]?.id || null;
}
function findWinnerIdByGeometry() {
    const tip = document.querySelector(".pointer")?.getBoundingClientRect();
    if (!tip) return null;
    const tipX = tip.left + tip.width / 2, tipY = tip.top;

    let bestId = null, bestD2 = Infinity;
    document.querySelectorAll("#rotor .wheel-icons i[data-id]").forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const d2 = (cx - tipX) ** 2 + (cy - tipY) ** 2;
        if (d2 < bestD2) { bestD2 = d2; bestId = el.dataset.id; }
    });
    return bestId;
}
function findWinnerId() { return findWinnerIdByAngle() || findWinnerIdByGeometry(); }
window.findWinnerId = findWinnerId;

function highlightWinnerIcon(id) {
    document.querySelectorAll("#rotor .wheel-icons i").forEach(el => {
        el.style.transform = (el.style.transform || "").replace(/\s*scale\([^)]+\)/, "");
        el.style.filter = "";
        if (el.dataset.id === id) {
            el.style.filter = "drop-shadow(0 0 8px rgba(255,255,255,.7))";
            el.style.transform += " scale(1.15)";
        }
    });
}

/* Console print = nimi (mitte fa-klass) */
function iconToName(icon) {
    if (!icon) return "Gift";
    return icon.replace(/^fa-/, "").replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
}
function printWinnerInfoOnce(id) {
    if (!id) return;
    const base = SECTOR_CONFIG_BY_ID[id] || DEFAULT_SECTOR_STYLE;
    const name = base.name || iconToName(base.icon);
    console.log(`${id} | ${base.color} | ${name}`);
}

/* ── Winner focus overlay (eraldiseisev canvas) ───────────────── */
let HL_CANVAS = null, HL_CTX = null;
let GLOW_RAF = 0, GLOW_STOP_AT = 0;

function ensureHighlightCanvas() {
    if (HL_CANVAS && HL_CTX) return;
    const rotor = document.getElementById("rotor");
    const wheel = document.getElementById("wheel");
    if (!rotor || !wheel) return;

    HL_CANVAS = document.createElement("canvas");
    HL_CANVAS.id = "wheelHL";
    Object.assign(HL_CANVAS.style, {
        position: "absolute", inset: "0", pointerEvents: "none", zIndex: "2"
    });
    rotor.appendChild(HL_CANVAS);
    HL_CTX = HL_CANVAS.getContext("2d");
    sizeHighlightCanvas();
}
function sizeHighlightCanvas() {
    const wheel = document.getElementById("wheel");
    if (!wheel || !HL_CANVAS) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = wheel.getBoundingClientRect();
    const px = Math.max(240, Math.min(rect.width, rect.height || rect.width)) * dpr;
    HL_CANVAS.width = px;
    HL_CANVAS.height = px;
}
function clearSectorGlow() {
    if (!HL_CTX || !HL_CANVAS) return;
    HL_CTX.setTransform(1, 0, 0, 1, 0, 0);
    HL_CTX.clearRect(0, 0, HL_CANVAS.width, HL_CANVAS.height);
}
function cancelWinnerPulse() {
    if (GLOW_RAF) cancelAnimationFrame(GLOW_RAF);
    GLOW_RAF = 0; GLOW_STOP_AT = 0;
}

function hexToRgba(hex, a = 1) {
    let h = hex?.replace?.('#', '') || 'ffd28a';
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
}
function pathSectorRing(ctx, rInner, rOuter, a0, a1) {
    ctx.beginPath();
    ctx.arc(0, 0, rOuter, a0, a1);
    ctx.arc(0, 0, rInner, a1, a0, true);
    ctx.closePath();
}

/* joonista üks kaader: dim teised + pulse võitjal */
function drawWinnerFrame(idx, color, pulseT) {
    ensureHighlightCanvas(); sizeHighlightCanvas();
    if (!HL_CTX || idx == null || idx < 0) return;

    const ctx = HL_CTX;
    const px = HL_CANVAS.width;
    const cx = px / 2, cy = px / 2;
    const rOuter = Math.min(cx, cy) * 0.92;
    const rInner = rOuter * 0.58;

    const n = normalizeSectors().length;
    const step = (Math.PI * 2) / n;
    const phase = (typeof PHASE === "number") ? PHASE : 0;
    const a0 = phase + idx * step;
    const a1 = phase + (idx + 1) * step;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, px, px);
    ctx.translate(cx, cy);

    // 1) dim kõik teised sektorid (täis kattuvus, winner ring "välja lõigatud")
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.40)";
    ctx.fillRect(-cx, -cy, px, px);

    ctx.globalCompositeOperation = "destination-out";
    pathSectorRing(ctx, rInner, rOuter, a0, a1);
    ctx.fill();

    // 2) võitja pulse-glow
    ctx.globalCompositeOperation = "lighter";
    const fillA = 0.18 + 0.14 * pulseT;     // 0.18..0.32
    const strokeA = 0.45 + 0.35 * pulseT;   // 0.45..0.80

    pathSectorRing(ctx, rInner, rOuter, a0, a1);
    ctx.fillStyle = hexToRgba(color, fillA);
    ctx.fill();

    // välimine hõõg
    ctx.save();
    pathSectorRing(ctx, rInner, rOuter, a0, a1);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(0, 0, rOuter * 0.985, a0, a1);
    ctx.lineWidth = rOuter * 0.10;
    ctx.strokeStyle = hexToRgba(color, strokeA);
    ctx.shadowBlur = rOuter * 0.18;
    ctx.shadowColor = hexToRgba(color, 0.95);
    ctx.stroke();
    ctx.restore();

    // sisemise serva helendus
    ctx.beginPath();
    ctx.arc(0, 0, rInner * 1.02, a0, a1);
    ctx.lineWidth = rOuter * 0.04;
    ctx.strokeStyle = hexToRgba(color, 0.30 + 0.2 * pulseT);
    ctx.shadowBlur = rOuter * 0.08;
    ctx.shadowColor = hexToRgba(color, 0.6 + 0.3 * pulseT);
    ctx.stroke();
}

/* käivita ~2.2 s pulse, siis jäta staatiline */
function startWinnerPulse(idx, color, durationMs = 2200) {
    cancelWinnerPulse();
    const t0 = performance.now();
    GLOW_STOP_AT = t0 + durationMs;

    const tick = (now) => {
        if (now >= GLOW_STOP_AT) {
            // viimane staatiline kaader
            drawWinnerFrame(idx, color, 0.2);
            GLOW_RAF = 0; return;
        }
        const k = (now - t0) / 800;              // periood ~800ms
        const pulse = 0.5 + 0.5 * Math.sin(k * Math.PI * 2); // 0..1
        drawWinnerFrame(idx, color, pulse);
        GLOW_RAF = requestAnimationFrame(tick);
    };
    GLOW_RAF = requestAnimationFrame(tick);
}

/* Announce */
window.announceWheelResult = function () {
    const id = findWinnerId();
    if (id) {
        highlightWinnerIcon(id);
        printWinnerInfoOnce(id);

        const slices = normalizeSectors();
        const idx = slices.findIndex(s => s.id === id);
        const col = (SECTOR_CONFIG_BY_ID[id] || DEFAULT_SECTOR_STYLE).color;

        // käivita fookus (dim + pulse)
        startWinnerPulse(idx, col);

        if (typeof window.onWheelResult === "function") {
            try { window.onWheelResult({ id }); } catch { }
        }
    }
    return id || null;
};

/* Upright listener */
(function wireUprightListener() {
    const rotor = document.getElementById("rotor");
    if (!rotor || rotor.__uprightWired) return;
    rotor.__uprightWired = true;

    const upd = () => updateIconUpright();

    rotor.addEventListener("transitionrun", upd);
    rotor.addEventListener("transitionstart", upd);
    rotor.addEventListener("transitionend", upd);
    rotor.addEventListener("animationstart", upd);
    rotor.addEventListener("animationiteration", upd);
    rotor.addEventListener("animationend", upd);

    new MutationObserver(upd).observe(rotor, { attributes: true, attributeFilter: ["style", "class"] });

    requestAnimationFrame(upd);
})();

/* Puhasta fookus uue spin’i alguses ja resize’il */
(function wireFocusClearOnSpin() {
    const rotor = document.getElementById("rotor");
    if (!rotor || rotor.__focusWired) return;
    rotor.__focusWired = true;

    const clear = () => { cancelWinnerPulse(); clearSectorGlow(); };

    rotor.addEventListener("transitionrun", clear);
    rotor.addEventListener("transitionstart", clear);
    rotor.addEventListener("animationstart", clear);

    new MutationObserver(clear).observe(rotor, { attributes: true, attributeFilter: ["style", "class"] });
    window.addEventListener("resize", () => { sizeHighlightCanvas(); });
})();

/* Initial render */
function renderAll() { drawStaticWheel(); renderSectorIconsFromGlobals(); }
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll, { once: true });
} else {
    renderAll();
}
