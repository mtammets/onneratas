/* ──────────────────────────────────────────────────────────────
  Font Awesome – lisa automaatselt, kui lehel pole
────────────────────────────────────────────────────────────── */
(function ensureFontAwesome() {
  const hasFA = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .some(l => /font-?awesome|cdnjs\.cloudflare.*font-awesome/i.test(l.href));
  if (!hasFA) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
})();

/* ──────────────────────────────────────────────────────────────
  Sündmused
────────────────────────────────────────────────────────────── */
spinBtn?.addEventListener('click', () => {
  if (!spinning) spin?.();
});

spinAgain?.addEventListener('click', (e) => {
  e.preventDefault();
  prizeModal?.close?.();
  if (!spinning && hasFreeSpin?.()) spin?.();
});

historyBtn?.addEventListener('click', () => {
  renderHistory?.();
  historyModal?.showModal?.();
});

infoBtn?.addEventListener('click', () => infoDlg?.showModal?.());

// kerge throttling resize'ile
let _resizeRAF = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(_resizeRAF);
  _resizeRAF = requestAnimationFrame(() => {
    drawStaticWheel?.();
    ensureSectorIcons();          // ⟵ tagab, et igal sektoril on ikoon
    renderSectorIconsFromGlobals();
  });
});


/* ───────── Rahakoti sündmused ───────── */
function renderWallet() {
  const listEl = document.getElementById('walletList');
  const emptyEl = document.getElementById('walletEmpty');
  if (!listEl || !emptyEl) return;

  let list = [];
  try { list = getWallet() || []; } catch { list = []; }

  listEl.innerHTML = '';
  emptyEl.hidden = list.length > 0;
  if (list.length === 0) return;

  for (const item of list) {
    const row = document.createElement('div');
    row.className = 'wallet-row';
    if (Date.now() - (item.t || 0) < 3000) row.classList.add('win--new');

    const itemId = String(item.id || item.t || (Date.now() + Math.random()));
    row.dataset.id = itemId;

    // vasak blokk: (ikoon) + nimi  ← dot asendatud ikooniga
    const info = document.createElement('div');
    info.className = 'info';

    // vali ikoon (label / color / explicit)
    let faCls = '';
    try { faCls = iconClassFor(item) || 'fa-circle-dot'; } catch { faCls = 'fa-circle-dot'; }

    const ico = document.createElement('i');
    ico.className = `fa-solid ${faCls}`;
    Object.assign(ico.style, {
      margin: '0 8px 0 0',
      fontSize: '20px',
      opacity: '0.95',
      color: '#eef2ff',
      filter: 'drop-shadow(0 1px 0 rgba(0,0,0,.25))'
    });
    // kui label ei määra klassi ja on olemas heksavärv, kasuta toonina
    if (item.color && !ICONS_BY_LABEL[(item.label || '').toLowerCase()]) {
      ico.style.color = String(item.color);
    }
    info.append(ico);

    const prizeName = document.createElement('div');
    prizeName.className = 'prize-name';
    prizeName.textContent = item.label || item.name || item.color || 'Võit';
    info.append(prizeName);

    // parem blokk: ainult nupp
    const meta = document.createElement('div');
    meta.className = 'meta';

    const btn = document.createElement('button');
    btn.className = 'withdraw-btn';
    btn.type = 'button';
    btn.textContent = 'VÕTA VÄLJA';
    btn.addEventListener('click', () => {
      const removed = removeFromWallet(item.id);
      if (removed) {
        addHistory({
          label: `Välja võetud: ${removed.label || removed.color || 'Võit'}`,
          color: '#9cffc3'
        });
      }
      renderWallet();
      updateWalletBadge();
    });

    meta.append(btn);
    row.append(info, meta);
    listEl.appendChild(row);
  }
}

function updateWalletBadge() {
  const badge = document.getElementById('walletBadge');
  if (!badge) return;
  let n = 0;
  try { n = (getWallet() || []).length; } catch { }
  badge.textContent = n > 0 ? String(n) : '';
  badge.hidden = !(n > 0);
}

/* ─── Casino-style highlight värskele võidule ─────────── */
function highlightWalletItem(id) {
  if (!id) return;
  const safe = String(id).replace(/"/g, '\\"');
  const el = document.querySelector(`#walletList [data-id="${safe}"]`);
  if (!el) return;
  el.classList.add('win--flash');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  try { navigator.vibrate && navigator.vibrate([20, 30, 20]); } catch { }
  setTimeout(() => el.classList.remove('win--flash'), 2000);
}


/* ──────────────────────────────────────────────────────────────
   Ratta sektorite ikoonid (Font Awesome)
   - Joonistatakse .rotor sisse (pöörleb koos rattaga)
   - Auto: label → ikoon, color → ikoon; kui ikka puudub, jagame
     ikoonid ühtlaselt DEFAULT_ICON_POOL-ist, et igal sektoril oleks erinev
────────────────────────────────────────────────────────────── */

// heksa → ikoon (kohanda oma paleti järgi)
const ICONS_BY_HEX = {
  '#ffd166': 'fa-crown',     // kuldne
  '#62d394': 'fa-leaf',      // roheline
  '#ffa366': 'fa-fire',      // oranž
  '#9cd7ff': 'fa-gem',       // helesinine
  '#a881e6': 'fa-star',      // lilla
  '#5aa7f9': 'fa-ship',      // sinine
  '#f7a1c0': 'fa-heart',     // roosa
  '#c9cbd1': 'fa-cloud',     // hall
  '#ff3b30': 'fa-heart'      // punakam
};

// silt (sh eesti värvinimed) → ikoon
const ICONS_BY_LABEL = {
  // auhinnavihjed
  mega: 'fa-crown', jackpot: 'fa-sack-dollar', suur: 'fa-gift',
  spin: 'fa-rotate', boonus: 'fa-ticket', cash: 'fa-coins', raha: 'fa-coins',
  mystery: 'fa-question', wild: 'fa-bolt',

  // värvid (EE + ilma täpitäheta)
  'oranž': 'fa-fire', 'oranz': 'fa-fire',
  'helesinine': 'fa-droplet', 'sinine': 'fa-gem',
  'roosa': 'fa-heart', 'lilla': 'fa-star',
  'kuldne': 'fa-crown', 'kollane': 'fa-sun',
  'roheline': 'fa-leaf', 'hall': 'fa-cloud'
};

// unikaalsuse jaoks varuikoonid
const DEFAULT_ICON_POOL = [
  'fa-crown', 'fa-gem', 'fa-gift', 'fa-bolt', 'fa-sack-dollar', 'fa-star',
  'fa-ticket', 'fa-leaf', 'fa-heart', 'fa-fire', 'fa-ship', 'fa-chess-king'
];

function normalizeHex(hex) {
  if (!hex) return '';
  const v = String(hex).trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  return v;
}

/* tagasta klass või '' (ei lisa automaatselt fallback-ikooni) */
function iconClassFor(obj = {}) {
  if (obj.icon) return obj.icon; // explicit override
  const lbl = (obj.label || obj.name || obj.color || '').toString().toLowerCase();
  for (const k in ICONS_BY_LABEL) if (lbl.includes(k)) return ICONS_BY_LABEL[k];
  const hex = normalizeHex(obj.color);
  if (ICONS_BY_HEX[hex]) return ICONS_BY_HEX[hex];
  return '';
}

function getSectors() {
  if (Array.isArray(window.WHEEL_SLICES)) return window.WHEEL_SLICES;
  if (Array.isArray(window.SECTORS)) return window.SECTORS;
  return [];
}

/* Kirjuta ikoonid sektoritesse, kui neid pole — et igal sektoril oleks oma */
function ensureSectorIcons() {
  const sectors = getSectors();
  if (!sectors.length) return;

  const used = new Set(
    sectors.map(s => (s && s.icon) ? s.icon : iconClassFor(s)).filter(Boolean)
  );

  for (let i = 0; i < sectors.length; i++) {
    const s = sectors[i] || {};
    if (s.icon) continue;

    const inferred = iconClassFor(s);
    if (inferred) { s.icon = inferred; used.add(inferred); continue; }

    // vali unikaalne varu
    let pick = '';
    for (let k = 0; k < DEFAULT_ICON_POOL.length; k++) {
      const idx = (i + k) % DEFAULT_ICON_POOL.length;
      const candidate = DEFAULT_ICON_POOL[idx];
      if (!used.has(candidate)) { pick = candidate; break; }
    }
    if (!pick) pick = DEFAULT_ICON_POOL[i % DEFAULT_ICON_POOL.length];
    s.icon = pick;
    used.add(pick);
  }
}

function renderSectorIconsFromGlobals() {
  const rotor = document.querySelector('.wheel-wrap .rotor');
  if (!rotor) return;

  rotor.querySelector('.wheel-icons')?.remove();

  const sectors = getSectors();
  if (!sectors.length) return;

  const side = Math.min(rotor.clientWidth || 0, rotor.clientHeight || 0);
  if (!side) return;

  ensureSectorIcons();

  const R = (side * 0.92) / 2;
  const r = R * 0.62;
  const step = (Math.PI * 2) / sectors.length;
  const offset = -Math.PI / 2; // 0rad -> ülal

  const layer = document.createElement('div');
  layer.className = 'wheel-icons';
  Object.assign(layer.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });

  const baseSize = Math.max(16, Math.round(side * 0.085));
  for (let i = 0; i < sectors.length; i++) {
    const mid = offset + (i + 0.5) * step;
    const cx = side / 2 + Math.cos(mid) * r;
    const cy = side / 2 + Math.sin(mid) * r;

    const cls = sectors[i]?.icon || iconClassFor(sectors[i]) || '';
    if (!cls) continue;

    const ico = document.createElement('i');
    ico.className = `fa-solid ${cls}`;
    Object.assign(ico.style, {
      position: 'absolute',
      left: `${cx}px`,
      top: `${cy}px`,
      transform: 'translate(-50%,-50%)',
      fontSize: `${baseSize}px`,
      color: '#eef2ff',
      textShadow: '0 1px 0 rgba(0,0,0,.35), 0 0 10px rgba(0,0,0,.25), 0 0 14px rgba(255,255,255,.08)',
      opacity: '0.95'
    });

    layer.appendChild(ico);
  }

  rotor.appendChild(layer);
}

// esmane joonistus
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ensureSectorIcons();
    renderSectorIconsFromGlobals();
  });
} else {
  ensureSectorIcons();
  renderSectorIconsFromGlobals();
}

// joonista ikoonid uuesti pärast lõuendi joonistamist
if (typeof window.drawStaticWheel === 'function') {
  const _orig = window.drawStaticWheel;
  window.drawStaticWheel = function patchedDrawStaticWheel(...args) {
    const ret = _orig.apply(this, args);
    try {
      ensureSectorIcons();
      renderSectorIconsFromGlobals();
    } catch { }
    return ret;
  };
}


