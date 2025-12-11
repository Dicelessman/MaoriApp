# Firebase Security Rules - Documentazione

Questo documento descrive le regole di sicurezza Firestore implementate per proteggere i dati dell'applicazione.

## File delle Regole

Le regole sono definite in `firestore.rules`. Questo file deve essere deployato su Firebase.

## Come Deployare le Regole

### Metodo 1: Firebase CLI (Consigliato)

1. Installa Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login:
```bash
firebase login
```

3. Inizializza progetto (se non già fatto):
```bash
firebase init firestore
```

4. Deploy regole:
```bash
firebase deploy --only firestore:rules
```

### Metodo 2: Firebase Console

1. Vai alla [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto
3. Vai su **Firestore Database** → **Rules**
4. Copia il contenuto di `firestore.rules`
5. Incolla nelle regole
6. Clicca **Publish**

## Regole Implementate

### Requisiti Generali

- **Autenticazione**: Tutte le operazioni richiedono autenticazione (utente loggato)
- **Staff Only**: Solo utenti autenticati possono modificare dati (tutti gli utenti autenticati sono considerati staff)

---

### Collezione: `scouts`

**Lettura**: ✅ Utenti autenticati

**Creazione**: ✅ Staff autenticato
- Richiede: `nome` (string, 1-100 caratteri), `cognome` (string, 1-100 caratteri)
- Altri campi opzionali permessi

**Aggiornamento**: ✅ Staff autenticato
- `id` non modificabile
- `nome` e `cognome` validati se modificati (1-100 caratteri)

**Eliminazione**: ✅ Staff autenticato

---

### Collezione: `staff`

**Lettura**: ✅ Utenti autenticati

**Creazione**: ✅ Staff autenticato
- Richiede: `nome` (string, 1-100 caratteri), `cognome` (string, 1-100 caratteri), `email` (formato valido)

**Aggiornamento**: ✅ Staff autenticato
- `id` non modificabile
- `nome`, `cognome`, `email` validati se modificati

**Eliminazione**: ✅ Staff autenticato

---

### Collezione: `activities`

**Lettura**: ✅ Utenti autenticati

**Creazione**: ✅ Staff autenticato
- Richiede: `tipo` (valido: 'Riunione', 'Attività lunga', 'Uscita', 'Campo'), `data` (timestamp), `descrizione` (string, 1-500 caratteri)
- `costo` opzionale (number >= 0)

**Aggiornamento**: ✅ Staff autenticato
- `id` non modificabile
- Campi validati se modificati

**Eliminazione**: ✅ Staff autenticato

---

### Collezione: `presences`

**Lettura**: ✅ Utenti autenticati

**Creazione**: ✅ Staff autenticato
- Richiede: `esploratoreId` (string), `attivitaId` (string)
- `stato` opzionale (valido: 'Presente', 'Assente', 'NR', 'X')
- `pagato` opzionale (bool)
- `tipoPagamento` opzionale (valido: 'Contanti', 'Satispay', 'Bonifico', o null)

**Aggiornamento**: ✅ Staff autenticato
- `esploratoreId` e `attivitaId` non modificabili
- Permette aggiornamento parziale (merge) di singoli campi
- Campi validati se modificati

**Eliminazione**: ✅ Staff autenticato

---

### Collezione: `auditLogs`

**Lettura**: ✅ Utenti autenticati

**Creazione**: ✅ Staff autenticato (append-only)
- Richiede: `action`, `collection`, `documentId`, `timestamp`, `userId`
- `userId` deve corrispondere all'utente autenticato

**Aggiornamento**: ❌ NEGATO (append-only)

**Eliminazione**: ❌ NEGATO (per sicurezza)

---

## Validazioni Implementate

### Email
- Formato valido: `^[^@]+@[^@]+\\.[^@]+$`

### Stringhe
- Lunghezza minima: 1 carattere (dove richiesto)
- Lunghezza massima: 100 caratteri (nome, cognome), 500 caratteri (descrizione)

### Stati Presenza
- Valori validi: `'Presente'`, `'Assente'`, `'NR'`, `'X'`

### Tipi Pagamento
- Valori validi: `'Contanti'`, `'Satispay'`, `'Bonifico'`, o `null`

### Tipi Attività
- Valori validi: `'Riunione'`, `'Attività lunga'`, `'Uscita'`, `'Campo'`

### Numeri
- `costo`: deve essere `>= 0`

---

## Testing delle Regole

### Firebase Emulator (Consigliato)

1. Installa Firebase Emulator Suite:
```bash
npm install -g firebase-tools
firebase init emulators
```

2. Avvia emulator:
```bash
firebase emulators:start
```

3. Testa regole con script o manualmente nella console emulator.

### Testing Manuale

1. In Firebase Console → Firestore → Rules
2. Usa il "Rules Playground" per testare scenari
3. Verifica che le regole blocchino operazioni non autorizzate

---

## Miglioramenti Futuri

### Verifica Staff Reale

Attualmente tutti gli utenti autenticati sono considerati staff. In futuro si può migliorare:

```javascript
// Esempio futuro (non ancora implementato)
function isStaff() {
  return isAuthenticated() 
    && exists(/databases/$(database)/documents/staff/$(request.auth.uid));
}
```

### Rate Limiting

Le regole Firestore non supportano rate limiting nativo. Per rate limiting avanzato, considerare Cloud Functions.

### Validazione Cross-Document

Ad esempio, verificare che `esploratoreId` in `presences` esista in `scouts`:

```javascript
// Esempio futuro (richiede get())
function scoutExists(scoutId) {
  return exists(/databases/$(database)/documents/scouts/$(scoutId));
}
```

Nota: Questo può essere costoso in termini di performance se fatto per ogni write.

---

## Best Practices

1. **Principio del Least Privilege**: Le regole concedono solo i permessi minimi necessari
2. **Validazione Input**: Tutti gli input sono validati prima di essere scritti
3. **Immutabilità**: Campi critici come `id`, `esploratoreId`, `attivitaId` non sono modificabili
4. **Append-Only Logs**: `auditLogs` è append-only per integrità audit
5. **Default Deny**: Tutte le collezioni non esplicitamente permesse sono negate

---

## Troubleshooting

### Errore: "Missing or insufficient permissions"

1. Verifica che l'utente sia autenticato
2. Verifica che le regole siano deployate correttamente
3. Controlla i log Firestore per dettagli specifici

### Errore: "Validation failed"

1. Verifica che i dati inviati rispettino i vincoli (lunghezza, formato, tipo)
2. Controlla che i campi required siano presenti
3. Verifica che i valori enum siano tra quelli permessi

---

## Changelog

- **v1.0** (Fase 3): Regole iniziali implementate
  - Autenticazione richiesta per tutte le operazioni
  - Validazione input base
  - Append-only per audit logs

