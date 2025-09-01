// scripts/dialogs.js
(function registerDialogs() {
    function reg(id) {
        var el = document.getElementById(id);
        if (el && !el.showModal && window.dialogPolyfill) {
            dialogPolyfill.registerDialog(el);
        }
    }
    reg("loginModal");
    reg("prizeModal");
    reg("historyModal");
    reg("info");
})();
