#!/bin/bash
# Script per configurare le variabili d'ambiente in Vercel
# Questo script richiede input interattivo, esegui manualmente o usa echo per pipe

echo "Configurazione variabili d'ambiente Vercel"
echo ""
echo "Per ogni variabile, quando richiesto:"
echo "1. Incolla il valore"
echo "2. Seleziona Production, Preview e Development (premi Invio per confermare)"
echo ""

# VITE_FIREBASE_API_KEY
echo "=== VITE_FIREBASE_API_KEY ==="
echo "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4" | vercel env add VITE_FIREBASE_API_KEY production

# VITE_FIREBASE_AUTH_DOMAIN
echo "=== VITE_FIREBASE_AUTH_DOMAIN ==="
echo "presenziariomaori.firebaseapp.com" | vercel env add VITE_FIREBASE_AUTH_DOMAIN production

# VITE_FIREBASE_PROJECT_ID
echo "=== VITE_FIREBASE_PROJECT_ID ==="
echo "presenziariomaori" | vercel env add VITE_FIREBASE_PROJECT_ID production

# VITE_FIREBASE_STORAGE_BUCKET
echo "=== VITE_FIREBASE_STORAGE_BUCKET ==="
echo "presenziariomaori.firebasestorage.app" | vercel env add VITE_FIREBASE_STORAGE_BUCKET production

# VITE_FIREBASE_MESSAGING_SENDER_ID
echo "=== VITE_FIREBASE_MESSAGING_SENDER_ID ==="
echo "556210165397" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production

# VITE_FIREBASE_APP_ID
echo "=== VITE_FIREBASE_APP_ID ==="
echo "1:556210165397:web:4f434e78fb97f02d116d9c" | vercel env add VITE_FIREBASE_APP_ID production

echo ""
echo "✅ Variabili d'ambiente configurate!"

