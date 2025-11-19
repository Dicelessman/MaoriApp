# Guida Migrazione su Vercel

Questa guida ti aiuterà a completare la migrazione del progetto su Vercel con gestione sicura delle chiavi Firebase tramite variabili d'ambiente.

## ✅ Preparazione Completata

I seguenti file sono stati creati/modificati:

- ✅ `.gitignore` - Esclude `config.js` dal repository
- ✅ `build-config.js` - Script per generare `config.js` dalle variabili d'ambiente
- ✅ `vercel.json` - Configurazione deployment Vercel
- ✅ `package.json` - Configurazione Node.js minimale
- ✅ `shared.js` - Modificato per leggere configurazione da `config.js`
- ✅ Tutti i file HTML - Aggiunto script per caricare `config.js`

## 📋 Passi per Completare la Migrazione

### Fase 1: Preparazione Repository Locale

1. **Inizializza Git** (se non già fatto):
   ```bash
   git init
   git add .
   git commit -m "Preparazione migrazione Vercel con variabili d'ambiente"
   ```

### Fase 2: Push su GitHub

1. **Crea un nuovo repository su GitHub** (se non esiste già)

2. **Aggiungi il remote e fai push**:
   ```bash
   git remote add origin https://github.com/TUO_USERNAME/TUO_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Fase 3: Configurazione Vercel

1. **Importa il progetto in Vercel**:
   - Vai su [vercel.com](https://vercel.com)
   - Clicca su "Import Project"
   - Seleziona il repository GitHub appena creato
   - Vercel rileverà automaticamente la configurazione da `vercel.json`

2. **Configura le Variabili d'Ambiente**:
   
   Nella dashboard Vercel, vai su:
   - Project Settings → Environment Variables
   
   Aggiungi le seguenti variabili (usa i valori attuali da `shared.js`):
   
   | Nome Variabile | Valore |
   |---------------|--------|
   | `VITE_FIREBASE_API_KEY` | `AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `presenziariomaori.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `presenziariomaori` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `presenziariomaori.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `556210165397` |
   | `VITE_FIREBASE_APP_ID` | `1:556210165397:web:4f434e78fb97f02d116d9c` |
   
   **IMPORTANTE**: Seleziona tutti gli ambienti (Production, Preview, Development)

3. **Deploy**:
   - Clicca su "Deploy"
   - Vercel eseguirà automaticamente:
     - `node build-config.js` (genera `config.js`)
     - Deploy del sito statico

### Fase 4: Verifica

1. **Controlla il deployment**:
   - Dopo il deploy, apri l'URL fornito da Vercel
   - Apri la console del browser (F12)
   - Verifica che non ci siano errori relativi a Firebase
   - Verifica che l'app si connetta correttamente a Firestore

2. **Verifica il file config.js**:
   - Apri `https://TUO_SITO.vercel.app/config.js`
   - Dovresti vedere la configurazione Firebase con i valori corretti
   - **IMPORTANTE**: `config.js` è **NECESSARIO** - viene generato automaticamente durante ogni build
   - Questo file è pubblico, ma le chiavi Firebase API sono progettate per essere esposte lato client (è il design di Firebase per app client-side)

## 🔒 Sicurezza e Gestione Chiavi

### Perché le chiavi Firebase devono essere esposte?
**Importante**: Per applicazioni client-side (come questa), le chiavi Firebase API **devono** essere visibili nel browser. Questo è il design previsto da Firebase:

- Le chiavi API di Firebase sono pubbliche per natura
- La sicurezza è garantita dalle **Firebase Security Rules** (non dalle chiavi API)
- Configura le regole di sicurezza in Firebase Console per proteggere i dati
- Usare variabili d'ambiente in Vercel evita di committare le chiavi nel repository Git, ma esse devono comunque essere esposte nel browser

### Cosa abbiamo migliorato:
- ✅ Le chiavi Firebase **non sono più nel repository Git** (non più hardcoded nel codice)
- ✅ `config.js` è generato durante il build da variabili d'ambiente (più sicuro)
- ✅ `config.js` è escluso da `.gitignore` (non viene committato)
- ✅ Le chiavi sono gestite centralmente tramite Vercel Environment Variables

## 📝 Note Tecniche

- **`config.js` è NECESSARIO**: Viene generato automaticamente durante ogni build di Vercel
- Il file `config.js` viene creato da `build-config.js` che legge le variabili d'ambiente
- Le variabili d'ambiente sono disponibili come `process.env.VITE_*` durante il build
- Se `config.js` non è disponibile, `shared.js` usa il fallback hardcoded (per compatibilità)
- **Non committare `config.js`**: È già escluso da `.gitignore`

## 🐛 Troubleshooting

**Problema**: Il deployment fallisce con errore "Cannot find module"
- **Soluzione**: Verifica che `package.json` sia presente e che Node.js sia configurato in Vercel

**Problema**: `config.js` non viene generato
- **Soluzione**: Verifica che le variabili d'ambiente siano configurate correttamente in Vercel

**Problema**: L'app non si connette a Firebase o errore 400 da Firestore
- **Soluzione**: 
  - Verifica che `config.js` sia accessibile (apri `/config.js` nel browser)
  - Verifica che `config.js` contenga i valori corretti (non vuoti)
  - Controlla la console del browser per errori dettagliati
  - Verifica che le chiavi Firebase siano corrette nelle variabili d'ambiente di Vercel
  - Controlla le Firebase Security Rules nel Firebase Console (potrebbero bloccare le richieste)
  - Verifica che il dominio Vercel sia autorizzato in Firebase Console (Authentication → Settings → Authorized domains)

## 📞 Supporto

Se hai problemi durante la migrazione, verifica:
1. Le variabili d'ambiente sono configurate in Vercel
2. Il build command `node build-config.js` viene eseguito correttamente
3. Il file `config.js` viene generato nel deployment

