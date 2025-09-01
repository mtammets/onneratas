



/* ──────────────────────────────────────────────────────────────
   Wallet (MINU VÕIDUD) — kuva ikooni NIMI (mitte konsoolirida)
────────────────────────────────────────────────────────────── */
(function () {
    // "fa-fire" -> "Fire", "fa-cloud" -> "Cloud"
    function iconToName(icon) {
        if (!icon) return "";
        return icon
            .replace(/^fa-/, "")
            .replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
    }

    // Leia nimi eelistuse järjekorras: item.name → SECTOR_CONFIG.name → iconToName(icon)
    function resolveName(item) {
        if (item?.name) return item.name;
        const byId = (typeof SECTOR_CONFIG_BY_ID !== "undefined" && item?.sectorId)
            ? SECTOR_CONFIG_BY_ID[item.sectorId]
            : null;
        if (byId?.name) return byId.name;
        return iconToName(item?.icon || byId?.icon);
    }



    // Leia kuvamiseks ka ikoon ja värv (kui need itemis puuduvad)
    function resolveIcon(item) {
        const byId = (typeof SECTOR_CONFIG_BY_ID !== "undefined" && item?.sectorId)
            ? SECTOR_CONFIG_BY_ID[item.sectorId]
            : null;
        return item?.icon || byId?.icon || "fa-gift";
    }
    function resolveColor(item) {
        const byId = (typeof SECTOR_CONFIG_BY_ID !== "undefined" && item?.sectorId)
            ? SECTOR_CONFIG_BY_ID[item.sectorId]
            : null;
        return item?.color || byId?.color || "#ffd28a";
    }

    window.renderWallet = function () {
        const list = document.getElementById("walletList");
        const empty = document.getElementById("walletEmpty");
        if (!list || !empty) return;

        const items = getWallet?.() || [];
        list.innerHTML = "";

        if (!items.length) { empty.style.display = "block"; return; }
        empty.style.display = "none";

        // ...
        items.forEach(item => {
            const row = document.createElement("div");
            row.className = "free-card"; // sama pind mis meteril

            const name = resolveName(item);            // sinu varasem helper jääb samaks
            const icon = resolveIcon(item);
            const color = resolveColor(item);

            const info = document.createElement("div");
            info.className = "info lbl";               // sama klass mis meteris
            info.innerHTML = `
    <i class="fa-solid ${icon}" style="color:${color}"></i>
    <span class="wallet-name">${name || item.consoleLine || ""}</span>
  `;

            const btn = document.createElement("button");
            btn.className = "primary";

            btn.textContent = "VÕTA VÄLJA";
            btn.onclick = () => { removeFromWallet?.(item.id); renderWallet(); };

            row.append(info, btn);
            list.appendChild(row);
        });
        // ...

    };

    document.getElementById("myPrizesBtn")?.addEventListener("click", () => {
        renderWallet(); document.getElementById("walletModal")?.showModal();
    });
    document.getElementById("walletWithdrawAll")?.addEventListener("click", () => {
        clearWallet?.(); renderWallet();
    });
})();

