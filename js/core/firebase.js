/**
 * Firebase Configuration and Initialization
 * @module core/firebase
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, addDoc, setDoc, deleteDoc, updateDoc, onSnapshot, getDoc, query, limit, startAfter, orderBy, where, Timestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, updatePassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";

// Init Config
const firebaseConfig = (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) || {
    apiKey: "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4",
    authDomain: "presenziariomaori.firebaseapp.com",
    projectId: "presenziariomaori",
    storageBucket: "presenziariomaori.firebasestorage.app",
    messagingSenderId: "556210165397",
    appId: "1:556210165397:web:4f434e78fb97f02d116d9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize FCM only in browser and if service worker is supported
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
        messaging = getMessaging(app);
    } catch (e) {
        console.warn('FCM initialization failed:', e);
    }
}

// Collections references helper
const cols = {
    scouts: collection(db, 'scouts'),
    staff: collection(db, 'staff'),
    activities: collection(db, 'activities'),
    presences: collection(db, 'presences'),
    auditLogs: collection(db, 'auditLogs'),
};

export {
    app,
    db,
    auth,
    messaging,
    cols,
    // Re-export specific Firebase functions used by adapters
    onSnapshot, getDoc, query, limit, startAfter, orderBy, where, Timestamp,
    signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, updatePassword,
    getToken, onMessage
};
