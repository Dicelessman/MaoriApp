#!/bin/bash
# Script di deploy per Vercel
# Questo script configura le variabili d'ambiente e fa il deploy

echo "🚀 Avvio deploy su Vercel..."

# Prima verifica se sei autenticato
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Devi prima autenticarti con Vercel"
    echo "Esegui: vercel login"
    exit 1
fi

echo "✅ Autenticazione verificata"

# Configura le variabili d'ambiente
echo "📝 Configurazione variabili d'ambiente..."

vercel env add VITE_FIREBASE_API_KEY production <<< "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4"
vercel env add VITE_FIREBASE_AUTH_DOMAIN production <<< "presenziariomaori.firebaseapp.com"
vercel env add VITE_FIREBASE_PROJECT_ID production <<< "presenziariomaori"
vercel env add VITE_FIREBASE_STORAGE_BUCKET production <<< "presenziariomaori.firebasestorage.app"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production <<< "556210165397"
vercel env add VITE_FIREBASE_APP_ID production <<< "1:556210165397:web:4f434e78fb97f02d116d9c"

# Aggiungi anche per preview e development
vercel env add VITE_FIREBASE_API_KEY preview <<< "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4"
vercel env add VITE_FIREBASE_AUTH_DOMAIN preview <<< "presenziariomaori.firebaseapp.com"
vercel env add VITE_FIREBASE_PROJECT_ID preview <<< "presenziariomaori"
vercel env add VITE_FIREBASE_STORAGE_BUCKET preview <<< "presenziariomaori.firebasestorage.app"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID preview <<< "556210165397"
vercel env add VITE_FIREBASE_APP_ID preview <<< "1:556210165397:web:4f434e78fb97f02d116d9c"

vercel env add VITE_FIREBASE_API_KEY development <<< "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4"
vercel env add VITE_FIREBASE_AUTH_DOMAIN development <<< "presenziariomaori.firebaseapp.com"
vercel env add VITE_FIREBASE_PROJECT_ID development <<< "presenziariomaori"
vercel env add VITE_FIREBASE_STORAGE_BUCKET development <<< "presenziariomaori.firebasestorage.app"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID development <<< "556210165397"
vercel env add VITE_FIREBASE_APP_ID development <<< "1:556210165397:web:4f434e78fb97f02d116d9c"

echo "✅ Variabili d'ambiente configurate"

# Deploy
echo "🚀 Deploy in corso..."
vercel --prod

echo "✅ Deploy completato!"

