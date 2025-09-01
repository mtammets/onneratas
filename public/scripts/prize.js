



/* ──────────────────────────────────────────────────────────────
   Prize + Wallet sildamine (kasutab wheel.js id/color/icon)
────────────────────────────────────────────────────────────── */
(function () {
    function fromId(id) {
        const base = (window.SECTOR_CONFIG_BY_ID && SECTOR_CONFIG_BY_ID[id]) || { color: "#ffd28a", icon: "fa-gift", name: "Gift" };
        return {
            id,
            color: base.color,
            icon: base.icon,
            name: base.name,
            consoleLine: `${id} | ${base.color} | ${base.name}`
        };
    }

    function show(win) {
        try { blastConfetti?.(); } catch { }
        prizeEmoji && (prizeEmoji.innerHTML = `<i class="fa-solid ${win.icon}" aria-hidden="true"></i>`);
        prizeText && (prizeText.textContent = win.id);
        prizeNote && (prizeNote.textContent = `Värv: ${win.color}`);
        const t = document.getElementById("prizeTitle"); if (t) t.textContent = "Palju õnne!";
    }

    // wheel.js kutsub seda pärast peatumist
    window.onWheelResult = function ({ id }) {
        if (!id) return;
        const win = fromId(id);
        show(win);
        addToWallet?.({ sectorId: id, color: win.color, icon: win.icon, name: win.name, consoleLine: win.consoleLine });
        if (document.getElementById("walletModal")?.open) renderWallet?.();
    };

    // Fallback: kui kuskil kutsutakse onStop(), suuname wheel’i id peale
    window.onStop = function () {
        const id = typeof findWinnerId === "function" ? findWinnerId() : null;
        if (id) window.onWheelResult({ id });
    };
})();
