/* ──────────────────────────────────────────────────────────────
   Prize + Wallet sildamine (kasutab wheel.js id/color/icon)
────────────────────────────────────────────────────────────── */
(function () {
    function fromId(id) {
        const base = (window.SECTOR_CONFIG_BY_ID && SECTOR_CONFIG_BY_ID[id]) || {
            color: "#ffd28a",
            icon: "fa-gift",
            name: "Gift"
        };
        return {
            id,
            color: base.color,
            icon: base.icon,
            name: base.name,
            consoleLine: `${id} | ${base.color} | ${base.name}`
        };
    }

    // Ei uuenda enam prizeTitle/prizeText DOM-e, jätame tühjaks
    function show(win) { }

    window.onStop = function () {
        const id = typeof findWinnerId === "function" ? findWinnerId() : null;
        if (id) window.onWheelResult?.({ id });
    };
})();


(function () {
    function fromId(id) {
        const base = (window.SECTOR_CONFIG_BY_ID && SECTOR_CONFIG_BY_ID[id]) || {
            color: "#ffd28a",
            icon: "fa-gift",
            name: "Võit"
        };
        return { id, color: base.color, icon: base.icon, name: base.name };
    }

    const pickFxColor = (hex) => hex || "#ffd28a";

    // 💥 Super-efekt koos tekstiga (tekst jääb kuni järgmise spinni alguseni)
    function showWinBlast({ name, color }) {
        const bulbs = document.getElementById("bulbs");
        const pointer = document.querySelector(".pointer");
        const wrap = document.querySelector(".wheel-wrap");
        const flash = document.getElementById("screenFlash");

        const fx = pickFxColor(color);
        document.documentElement.style.setProperty("--fx", fx);

        // === Teksti overlay ===
        let overlay = document.getElementById("winOverlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "winOverlay";
            Object.assign(overlay.style, {
                position: "fixed",
                inset: "0",
                display: "grid",
                placeItems: "center",
                zIndex: "9999",
                pointerEvents: "none",
                fontSize: "2.5rem",
                fontWeight: "900",
                color: "#ffd28a",
                textShadow: "0 0 12px black, 0 0 20px rgba(255,210,138,.9)",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
            });
            document.body.appendChild(overlay);
        }
        overlay.textContent = name || "VÕIT";
        overlay.style.display = "grid";

        // Ekraani välk
        if (flash) {
            flash.hidden = false;
            flash.classList.add("flash-in");
            setTimeout(() => {
                flash.classList.remove("flash-in");
                flash.hidden = true;
            }, 280);
        }

        // Raputus
        wrap?.classList.add("shake");
        setTimeout(() => wrap?.classList.remove("shake"), 600);

        // Pirnide strobe + pointeri flash
        bulbs?.classList.add("strobe");
        pointer?.classList.add("flash");
        setTimeout(() => {
            bulbs?.classList.remove("strobe");
            pointer?.classList.remove("flash");
        }, 2200);

        // Heli
        const fxWin = document.getElementById("fxWin");
        try {
            if (fxWin?.play) {
                fxWin.currentTime = 0;
                fxWin.play();
            }
        } catch (e) { }

        // Konfeti
        if (typeof blastConfetti === "function") blastConfetti();

        // Pane overlay kaduma alles siis, kui uus spin algab
        const obs = new MutationObserver(() => {
            if (wrap?.classList.contains("wheel-active")) {
                overlay.style.display = "none";
            }
        });
        if (wrap) {
            obs.observe(wrap, { attributes: true, attributeFilter: ["class"] });
        }
    }

    // Tulemustöötlus
    window.onWheelResult = function ({ id }) {
        if (!id) return;
        const win = fromId(id);

        // Efekt + tekst
        showWinBlast(win);

        // Rahakoti uuendus
        try {
            addToWallet?.({
                sectorId: id,
                color: win.color,
                icon: win.icon,
                name: win.name,
                consoleLine: `${id} | ${win.color} | ${win.name}`
            });
            if (document.getElementById("walletModal")?.open) renderWallet?.();
        } catch (_) { }
    };
})();
