/* Tick-helid + pirnide sähvatus */
function makeTickPlayer(slices) {
    let ac;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no audio */ }

    let last = -1;
    return (angRad) => {
        const step = TAU / slices;
        const idx = Math.floor((((angRad % TAU) + TAU) % TAU) / step);

        if (idx === last) return;
        last = idx;

        if (ac) {
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = 'triangle';
            o.frequency.value = 1200;

            g.gain.setValueAtTime(0.0001, ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.09);

            o.connect(g).connect(ac.destination);
            o.start();
            o.stop(ac.currentTime + 0.1);
        }

        if (lights[idx]) {
            lights[idx].style.transform = 'scale(1.35)';
            lights[idx].style.filter = 'brightness(1.6)';
            setTimeout(() => {
                lights[idx].style.transform = '';
                lights[idx].style.filter = '';
            }, 90);
        }
    };
}
