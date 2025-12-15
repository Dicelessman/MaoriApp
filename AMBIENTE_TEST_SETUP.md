# Setup Ambiente di Test Separato

Questa guida spiega come configurare un ambiente di test separato per sviluppare nuove funzionalità senza intaccare il database di produzione.

## Strategia

1. **Branch Git separato**: Un branch `develop` o `test` per le nuove funzionalità
2. **Progetto Firebase separato**: Un nuovo progetto Firebase per i dati di test
3. **Deployment Vercel separato**: Un deployment separato per l'ambiente di test
4. **Variabili d'ambiente separate**: Configurazioni Firebase diverse per ogni ambiente

## Passo 1: Creare un Nuovo Progetto Firebase per Test

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca su "Aggiungi progetto"
3. Nome: `maori-app-test` (o un nome a tua scelta)
4. Segui la procedura guidata (disabilita Google Analytics se non necessario)
5. Una volta creato, vai su "Impostazioni progetto" → "Le tue app" → "Web"
6. Registra una nuova app web (es: `maori-app-test`)
7. Copia le credenziali Firebase (le userai nel Passo 3)

### Configurare Firestore per Test

1. Nel progetto Firebase di test, vai su "Firestore Database"
2. Crea un database in modalità test (o produzione, se vuoi testare anche le regole)
3. Copia le regole di sicurezza da `firestore.rules` del progetto principale

## Passo 2: Creare Branch Git per Test

```bash
# Assicurati di essere sul branch main/master (versione stabile)
git checkout main

# Crea un nuovo branch per sviluppi/test
git checkout -b develop

# Push del nuovo branch su GitHub
git push -u origin develop
```

**Branch suggeriti:**
- `main` o `master`: Versione stabile di produzione
- `develop`: Sviluppo e test di nuove funzionalità
- `feature/*`: Branch per singole funzionalità (opzionale)

## Passo 3: Configurare Vercel per Ambienti Separati

Vercel supporta nativamente ambienti separati tramite branch e variabili d'ambiente.

### 3.1 Configurare Deployment Production (main)

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su "Settings" → "Git"
4. Assicurati che il branch di produzione sia `main` (o `master`)
5. Vai su "Settings" → "Environment Variables"
6. Verifica che le variabili Firebase di produzione siano configurate:
   - `VITE_FIREBASE_API_KEY` (Production)
   - `VITE_FIREBASE_AUTH_DOMAIN` (Production)
   - `VITE_FIREBASE_PROJECT_ID` (Production)
   - `VITE_FIREBASE_STORAGE_BUCKET` (Production)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` (Production)
   - `VITE_FIREBASE_APP_ID` (Production)

### 3.2 Configurare Deployment Test (develop)

1. Nello stesso progetto Vercel, vai su "Settings" → "Git"
2. In "Production Branch" mantieni `main`
3. Vai su "Settings" → "Environment Variables"
4. Aggiungi le stesse variabili ma con valori del progetto Firebase di TEST:
   - Clicca "Add New"
   - Nome: `VITE_FIREBASE_API_KEY`
   - Valore: [API Key del progetto Firebase TEST]
   - Environment: Seleziona **"Preview"** (o "Development")
   - Clicca "Save"
5. Ripeti per tutte le variabili Firebase con i valori del progetto di test
6. **IMPORTANTE**: Assicurati di selezionare "Preview" (non "Production") per queste variabili

### 3.3 Configurare Branch per Preview Deployments

1. Vai su "Settings" → "Git" → "Ignored Build Step"
2. (Opzionale) Configura per ignorare certi branch:
   ```
   # Ignora branch che non sono main o develop
   git diff HEAD^ HEAD --quiet .
   ```

## Passo 4: Configurare Vercel per Deploy Automatici

1. Vai su "Settings" → "Git"
2. Verifica che "Automatic deployments from Git" sia attivo
3. Ogni push su `main` → deploy su URL di produzione
4. Ogni push su `develop` → deploy su URL di preview/test

## Passo 5: Workflow di Sviluppo

### Per sviluppare nuove funzionalità:

```bash
# 1. Assicurati di essere aggiornato
git checkout main
git pull origin main

# 2. Passa al branch di sviluppo
git checkout develop
git pull origin develop

# 3. Crea un branch per la feature (opzionale ma consigliato)
git checkout -b feature/nuova-funzionalita

# 4. Sviluppa e committa
git add .
git commit -m "feat: aggiunge nuova funzionalità"

# 5. Push (crea automaticamente un preview deployment su Vercel)
git push origin feature/nuova-funzionalita

# 6. Testa su URL di preview

# 7. Quando pronta, merge su develop
git checkout develop
git merge feature/nuova-funzionalita
git push origin develop

# 8. Quando tutto è testato e stabile, merge su main
git checkout main
git merge develop
git push origin main  # Deploy automatico su produzione
```

## Passo 6: Identificare l'Ambiente nel Codice (Opzionale)

Se vuoi aggiungere un banner o log per identificare l'ambiente di test, puoi modificare `shared.js`:

```javascript
// Aggiungi all'inizio di shared.js, dopo l'inizializzazione Firebase
const isTestEnvironment = () => {
  const config = window.__FIREBASE_CONFIG__ || {};
  // Confronta con il projectId di test
  return config.projectId === 'maori-app-test'; // Sostituisci con il tuo projectId di test
};

// Mostra un banner nell'ambiente di test
if (isTestEnvironment() && typeof document !== 'undefined') {
  const banner = document.createElement('div');
  banner.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: orange; color: white; text-align: center; padding: 10px; z-index: 9999; font-weight: bold;';
  banner.textContent = '⚠️ AMBIENTE DI TEST - Database separato';
  document.body.appendChild(banner);
}
```

## Passo 7: Gestire le Regole Firestore per Test

Le regole di sicurezza possono essere diverse tra produzione e test. Opzioni:

### Opzione A: Regole identiche (consigliato inizialmente)
Copia semplicemente `firestore.rules` nel progetto Firebase di test.

### Opzione B: Regole più permissive per test
Modifica le regole nel progetto di test per permettere più operazioni durante lo sviluppo.

Per deployare regole:
```bash
firebase deploy --only firestore:rules --project maori-app-test
```

## URL e Accessi

Dopo la configurazione:

- **Produzione**: `https://tuo-progetto.vercel.app` (branch `main`)
- **Test/Preview**: `https://tuo-progetto-git-develop-tuo-team.vercel.app` (branch `develop`)
  - L'URL esatto è visibile nei deployment di Vercel

## Sicurezza

✅ **Database separati**: I dati di test non toccano mai la produzione  
✅ **Autenticazione separata**: Gli utenti di test sono separati  
✅ **Variabili d'ambiente**: Le credenziali sono gestite da Vercel  
✅ **Branch protection**: (Opzionale) Proteggi `main` su GitHub richiedendo PR  

## Troubleshooting

### Le variabili d'ambiente non vengono caricate
- Verifica che siano configurate per l'ambiente corretto (Production vs Preview)
- Riavvia il deployment dopo aver aggiunto le variabili

### Il deployment usa il database sbagliato
- Verifica che le variabili d'ambiente siano corrette per il branch
- Controlla `config.js` nel deployment (non dovrebbe essere nel repo)

### Errori di permessi Firestore
- Verifica che le regole siano deployate anche nel progetto di test
- Controlla che gli utenti di test abbiano i permessi corretti

## Riassunto Rapido

1. ✅ Crea progetto Firebase `maori-app-test`
2. ✅ Crea branch `develop`
3. ✅ Aggiungi variabili Firebase TEST in Vercel (ambiente Preview)
4. ✅ Push su `develop` → deploy automatico su preview URL
5. ✅ Push su `main` → deploy automatico su produzione

## Workflow Consigliato

```
main (production) ← merge quando stabile
  ↑
develop (test) ← merge feature quando testate
  ↑
feature/* (singole feature) ← branch temporanei
```

Ogni push su un branch diverso da `main` crea automaticamente un preview deployment su Vercel con le variabili d'ambiente corrette!

