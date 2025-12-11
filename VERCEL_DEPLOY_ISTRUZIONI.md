# Istruzioni Deploy Vercel - Procedura Veloce

## ✅ Cosa è già fatto:
- ✅ Codice committato e pushato su GitHub (https://github.com/Dicelessman/MaoriApp)
- ✅ File `vercel.json` configurato
- ✅ File `build-config.js` pronto per generare `config.js`

## 🚀 Deploy tramite Dashboard Vercel (CONSIGLIATO)

### Passo 1: Importa il Progetto
1. Vai su https://vercel.com/dashboard
2. Clicca **"Add New..."** → **"Project"**
3. Seleziona **"Import Git Repository"**
4. Seleziona il repository: **Dicelessman/MaoriApp**
5. Clicca **"Import"**

### Passo 2: Configura il Progetto
1. Vercel rileverà automaticamente `vercel.json`
2. Verifica che:
   - **Framework Preset**: Other (o None)
   - **Build Command**: `node build-config.js`
   - **Output Directory**: `.`

### Passo 3: Configura Variabili d'Ambiente
**PRIMA di cliccare "Deploy"**, configura le variabili:

1. Nella sezione **"Environment Variables"**, clicca **"Add"** per ciascuna:

| Nome Variabile | Valore | Ambienti |
|---------------|--------|----------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_FIREBASE_AUTH_DOMAIN` | `presenziariomaori.firebaseapp.com` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_FIREBASE_PROJECT_ID` | `presenziariomaori` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_FIREBASE_STORAGE_BUCKET` | `presenziariomaori.firebasestorage.app` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `556210165397` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_FIREBASE_APP_ID` | `1:556210165397:web:4f434e78fb97f02d116d9c` | ✅ Production, ✅ Preview, ✅ Development |

**IMPORTANTE**: Seleziona tutti e tre gli ambienti (Production, Preview, Development) per ogni variabile!

### Passo 4: Deploy
1. Clicca **"Deploy"**
2. Attendi che il build completi
3. Una volta completato, Vercel ti fornirà l'URL del deployment

### Passo 5: Verifica
1. Apri l'URL fornito da Vercel
2. Controlla che l'app funzioni correttamente
3. Apri `/config.js` nell'URL per verificare che contenga la configurazione Firebase

---

## 🔧 Deploy tramite CLI (Alternativa)

Se preferisci usare la CLI, esegui questi comandi:

```bash
# 1. Collega il progetto (se non già fatto)
vercel link

# 2. Configura variabili d'ambiente una per una
vercel env add VITE_FIREBASE_API_KEY production
# Incolla: AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4
# Seleziona: Production, Preview, Development

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Incolla: presenziariomaori.firebaseapp.com
# Seleziona: Production, Preview, Development

vercel env add VITE_FIREBASE_PROJECT_ID production
# Incolla: presenziariomaori
# Seleziona: Production, Preview, Development

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Incolla: presenziariomaori.firebasestorage.app
# Seleziona: Production, Preview, Development

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Incolla: 556210165397
# Seleziona: Production, Preview, Development

vercel env add VITE_FIREBASE_APP_ID production
# Incolla: 1:556210165397:web:4f434e78fb97f02d116d9c
# Seleziona: Production, Preview, Development

# 3. Deploy in produzione
vercel --prod
```

---

## 🐛 Troubleshooting

**Errore durante il build**: Verifica che Node.js sia selezionato in Vercel Project Settings

**config.js non generato**: Verifica che le variabili d'ambiente siano configurate correttamente

**App non si connette a Firebase**: 
- Verifica che il dominio Vercel sia autorizzato in Firebase Console
- Controlla Firebase Security Rules

## 📝 Note

- Il deploy tramite Dashboard è più semplice e intuitivo
- Le variabili d'ambiente possono essere modificate in qualsiasi momento dalla dashboard
- Ogni push su GitHub triggererà automaticamente un nuovo deployment (se configurato)

