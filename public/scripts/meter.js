/* “Meter” UI (tasuta keerutused → kaardid + AKTIVEERI) */
let meterTimer = null;
let lastHadFree = null; // Pane false, kui soovid toasti ka esimesel laadimisel, kui has===true
let freeSpinArmed = false;   // kas vähemalt üks kaart on aktiveeritud

const $id = (id) => document.getElementById(id);
const $qs = (sel) => document.querySelector(sel);

function safeFormatHMS(ms) {
    if (typeof formatHMS === 'function') return formatHMS(ms);
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
}
function safeMsToMidnight() {
    if (typeof msToMidnight === 'function') return msToMidnight();
    const now = new Date(); const next = new Date(now); next.setHours(24, 0, 0, 0); return next - now;
}

function formatFreeStatus(n) {
    const noun = (n === 1) ? 'Tasuta keerutus' : 'Tasuta keerutust';
    return `${n} ${noun} saadaval!`;
}
function showFreeToast(count) {
    if (!document.body) return;
    let t = $id('toastFree');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toastFree'; t.setAttribute('aria-live', 'polite');
        Object.assign(t.style, {
            position: 'fixed', left: '50%', bottom: '20px', transform: 'translateX(-50%)',
            padding: '12px 16px', borderRadius: '14px',
            background: 'linear-gradient(180deg,#ffd28a,#ff8a3a)', color: '#3b1300',
            fontWeight: '800', boxShadow: '0 10px 26px rgba(255,138,58,.28)', zIndex: '9999',
            opacity: '0', transition: 'opacity .4s'
        });
        document.body.appendChild(t);
    }
    t.textContent = formatFreeStatus(count);
    t.style.opacity = '1'; clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}

/* ─── Heli utiliit (AKTIVEERI klikk) ─────────────────────────── */
let activateAudio;
function playActivate() {
    try {
        if (!activateAudio) {
            activateAudio = new Audio('sounds/activate_click.mp3');
            activateAudio.preload = 'auto';
        }
        activateAudio.currentTime = 0;
        activateAudio.play();
    } catch (_) { /* ignore */ }
}

/* Globaalne API teistele failidele */
window.isFreeSpinArmed = () => !!freeSpinArmed;
window.disarmFreeSpin = () => { freeSpinArmed = false; updateMeter(); };

/* Abifunktsioon: aktiveeri just see kaart */
function armCard(list, card, btn, { clearGifOnArm }) {
    // tühista muud aktivatsioonid
    [...list.querySelectorAll('.free-card')].forEach(c => {
        c.classList.remove('armed');
        const b = c.querySelector('.arm-btn');
        if (b) { b.disabled = false; b.textContent = 'AKTIVEERI'; }
    });
    // märgi see kaart aktiveerituks
    card.classList.add('armed');
    btn.disabled = true;
    btn.textContent = 'AKTIVEERITUD';
    freeSpinArmed = true;

    if (clearGifOnArm) {
        const wrap = $qs('.wheel-wrap');
        wrap?.classList.remove('show-gif');
        const gif = $id('centerGif');
        if (gif) gif.removeAttribute('src');
    }

    // Üks allikas tõele: lase UI sünkrol joosta updateMeteris
    updateMeter();
}

/* Joonista kaardid ja aktiveerimise loogika (üks ja ainus versioon) */
function renderFreeCards(left, { clearGifOnArm = true } = {}) {
    const list = $id('freeList'); if (!list) return;
    list.innerHTML = '';

    for (let i = 0; i < left; i++) {
        const card = document.createElement('div');
        card.className = 'free-card';

        const info = document.createElement('div');
        info.className = 'info';
        info.innerHTML = `<span class="dot" aria-hidden="true"></span>
                      <span>Tasuta keerutus</span>`;

        const btn = document.createElement('button');
        btn.className = 'arm-btn';
        btn.type = 'button';
        btn.textContent = 'AKTIVEERI';

        btn.addEventListener('pointerdown', () => {
            if (!btn.disabled) playActivate();
        });

        btn.addEventListener('click', () => {
            armCard(list, card, btn, { clearGifOnArm });
        });

        card.appendChild(info);
        card.appendChild(btn);
        list.appendChild(card);
    }
}

/** Peafunktsioon — ainus koht, kus synchitakse UI (klassid, nupud, tekstid) */
function updateMeter() {
    if (typeof spinsLeftToday !== 'function' || typeof FREE_SPINS_PER_DAY === 'undefined') return;

    const left = Number(spinsLeftToday()) || 0;
    const has = left > 0;

    const meterEl = $qs('#freeMeter');
    const freeList = $id('freeList');
    const nextFreeInfo = $id('nextFreeInfo');
    const spinBtn = $id('spinBtn');
    const wrap = $qs('.wheel-wrap');

    // Klassid meterile
    if (meterEl) {
        meterEl.classList.toggle('meter--empty', !has);
        meterEl.classList.toggle('meter--has', has);
    }

    if (has) {
        // Kaardid joonistab iga kord uuesti, et loendur “left” peegeldaks tõde
        renderFreeCards(left);
        if (nextFreeInfo) nextFreeInfo.textContent = '';
    } else {
        if (freeList) freeList.innerHTML = '';
        freeSpinArmed = false; // kui tasuta pole, siis pole ka “relvastatud”
        if (nextFreeInfo) nextFreeInfo.textContent =
            `Järgmise keerutuseni jäänud: ${safeFormatHMS(safeMsToMidnight())} `;
    }

    // Keskne tõde: spin-nupu lubamine ainult juhul, kui on kaart relvastatud
    if (spinBtn) spinBtn.disabled = !freeSpinArmed;

    // Ratta visuaalne olek ainult siin
    wrap?.classList.toggle('wheel-active', freeSpinArmed);

    // countdown ainult siis, kui tasuta puudub
    if (meterTimer) clearInterval(meterTimer);
    if (!has) {
        meterTimer = setInterval(() => {
            const ms = safeMsToMidnight();
            if (nextFreeInfo) nextFreeInfo.textContent =
                `Uus tasuta keerutus: ${safeFormatHMS(ms)} pärast`;
            if (ms <= 1000) updateMeter();
        }, 1000);
    }

    // Toast 0 → >0
    if (lastHadFree === false && has) showFreeToast(left);
    lastHadFree = has;
}
