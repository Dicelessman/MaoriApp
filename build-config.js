// build-config.js - Script per generare config.js dalle variabili d'ambiente
// Questo script viene eseguito durante il build di Vercel

const fs = require('fs');
const path = require('path');

// Leggi le variabili d'ambiente
// In Vercel, le variabili sono disponibili come process.env
// Usiamo prefisso VITE_ per compatibilità con Vite/standard frontend
const defaultLocalConfig = {
  apiKey: "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4",
  authDomain: "presenziariomaori.firebaseapp.com",
  projectId: "presenziariomaori",
  storageBucket: "presenziariomaori.firebasestorage.app",
  messagingSenderId: "556210165397",
  appId: "1:556210165397:web:4f434e78fb97f02d116d9c"
};

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || defaultLocalConfig.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || defaultLocalConfig.authDomain,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || defaultLocalConfig.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || defaultLocalConfig.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || defaultLocalConfig.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || defaultLocalConfig.appId
};

// Genera il contenuto del file config.js
const configContent = `// config.js - Configurazione Firebase generata automaticamente
// Questo file è generato durante il build e NON deve essere committato nel repository

window.__FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 2)};
`;

// Scrivi il file config.js nella root del progetto
const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✓ config.js generato con successo');
console.log('  Project ID:', config.projectId || '(non configurato)');

// Verifica che tutte le variabili siano presenti (warning se mancanti)
const missing = [];
if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
if (!config.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
if (!config.storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!config.messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');

if (missing.length > 0) {
  console.warn('\n⚠ ATTENZIONE: Variabili d\'ambiente mancanti:');
  missing.forEach(v => console.warn('  -', v));
  console.warn('\n  Configura le variabili d\'ambiente in Vercel Project Settings.');
}

