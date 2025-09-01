// public/scripts/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyDWzefH1MikHgK738-l-SyPqIjdhleWqbQ",
    authDomain: "onneratas-c3858.firebaseapp.com",
    projectId: "onneratas-c3858",
    storageBucket: "onneratas-c3858.firebasestorage.app",
    messagingSenderId: "451191372267",
    appId: "1:451191372267:web:61490d79722ce791dd01ae",
    measurementId: "G-L0VDL2JTP2"
};

const app = initializeApp(firebaseConfig);
// analytics võib http devis visata vea; püüame kinni
try { getAnalytics(app); } catch { }

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
