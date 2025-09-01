// public/scripts/login.js
import { auth } from './firebase.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

(function () {
    const dlg = document.getElementById('loginModal');
    if (!dlg) return;

    // Tab switching
    const tabs = Array.from(dlg.querySelectorAll('.auth-tab'));
    const panes = Array.from(dlg.querySelectorAll('.auth-pane'));
    function showPane(which) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.authTab === which));
        panes.forEach(p => p.classList.toggle('hidden', p.dataset.pane !== which));
        dlg.querySelector('header h3').textContent = which === 'signup' ? 'Loo konto' : 'Logi sisse';
    }
    tabs.forEach(t => t.addEventListener('click', () => showPane(t.dataset.authTab)));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

    // Toggle password visiblity
    function toggle(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const inp = document.getElementById(inputId);
        btn?.addEventListener('click', () => {
            const pw = inp.type === 'password';
            inp.type = pw ? 'text' : 'password';
            btn.innerHTML = `<i class="fa-solid ${pw ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
        });
    }
    toggle('toggleLoginPass', 'loginPass');
    toggle('toggleSuPass', 'suPass');
    toggle('toggleSuPass2', 'suPass2');

    // Helpers
    function setErr(input, msgEl, msg) {
        input.closest('.field')?.classList.toggle('invalid', !!msg);
        if (msgEl) msgEl.textContent = msg || '';
    }
    const mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // LOGIN
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail');
        const pass = document.getElementById('loginPass');
        const emailErr = document.getElementById('loginEmailErr');
        const passErr = document.getElementById('loginPassErr');

        let ok = true;
        if (!mailRe.test(email.value.trim())) { setErr(email, emailErr, 'Sisesta korrektne e-post.'); ok = false; }
        else setErr(email, emailErr, '');
        if ((pass.value || '').length < 6) { setErr(pass, passErr, 'Parool vähemalt 6 märki.'); ok = false; }
        else setErr(pass, passErr, '');
        if (!ok) return;

        const btn = document.getElementById('loginSubmitBtn');
        const orig = btn.textContent; btn.disabled = true; btn.textContent = 'Logib…';
        try {
            const cred = await signInWithEmailAndPassword(auth, email.value.trim(), pass.value);
            dlg.close();
            document.dispatchEvent(new CustomEvent('auth:login', {
                detail: { email: cred.user.email, uid: cred.user.uid, name: cred.user.displayName || '' }
            }));
        } catch (err) {
            const code = err?.code || '';
            const map = {
                'auth/invalid-email': 'E-posti formaat on vale.',
                'auth/missing-password': 'Parool on kohustuslik.',
                'auth/wrong-password': 'Vale parool.',
                'auth/user-not-found': 'Kasutajat ei leitud.',
                'auth/too-many-requests': 'Liiga palju katseid. Proovi hiljem uuesti.'
            };
            setErr(pass, passErr, map[code] || 'Vale e-post või parool.');
        } finally {
            btn.disabled = false; btn.textContent = orig;
        }
    });

    // SIGN UP
    const suForm = document.getElementById('signupForm');
    suForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('suName')?.value?.trim();
        const email = document.getElementById('suEmail');
        const pass = document.getElementById('suPass');
        const pass2 = document.getElementById('suPass2');
        const terms = document.getElementById('suTerms'); // võib puududa!

        let ok = true;
        if (!mailRe.test(email.value.trim())) { setErr(email, document.getElementById('suEmailErr'), 'Sisesta korrektne e-post.'); ok = false; }
        else setErr(email, document.getElementById('suEmailErr'), '');
        if ((pass.value || '').length < 6) { setErr(pass, document.getElementById('suPassErr'), 'Vähemalt 6 märki.'); ok = false; }
        else setErr(pass, document.getElementById('suPassErr'), '');
        if (pass.value !== pass2.value) { setErr(pass2, document.getElementById('suPass2Err'), 'Paroolid ei klapi.'); ok = false; }
        else setErr(pass2, document.getElementById('suPass2Err'), '');

        // Nõua tingimustega nõustumist ainult siis, kui checkbox on HTML-is olemas
        if (terms && !terms.checked) { terms.focus(); ok = false; }
        if (!ok) return;

        const btn = document.getElementById('signupSubmitBtn');
        const orig = btn.textContent; btn.disabled = true; btn.textContent = 'Loob…';
        try {
            const cred = await createUserWithEmailAndPassword(auth, email.value.trim(), pass.value);
            if (name) await updateProfile(cred.user, { displayName: name });
            try { await sendEmailVerification(cred.user); } catch (_) { }
            dlg.close();
            document.dispatchEvent(new CustomEvent('auth:signup', {
                detail: { email: cred.user.email, uid: cred.user.uid, name: name || '' }
            }));
        } catch (err) {
            const code = err?.code || '';
            if (code === 'auth/email-already-in-use' || code === 'auth/invalid-email') {
                setErr(email, document.getElementById('suEmailErr'), code === 'auth/email-already-in-use' ? 'See e-post on juba kasutusel.' : 'E-posti formaat on vale.');
            } else {
                setErr(pass, document.getElementById('suPassErr'), code === 'auth/weak-password' ? 'Parool peab olema vähemalt 6 märki.' : 'Midagi läks valesti. Proovi uuesti.');
            }
        } finally {
            btn.disabled = false; btn.textContent = orig;
        }
    });

    dlg.addEventListener('close', () => showPane('login'));
    showPane('login');
})();
