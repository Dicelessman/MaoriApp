# Indici Firestore Raccomandati

Questo documento elenca gli indici Firestore consigliati per ottimizzare le performance delle query.

## Come Creare Indici

1. Vai alla [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto
3. Vai su **Firestore Database** → **Indexes**
4. Clicca **Create Index**
5. Configura l'indice come indicato sotto

## Indici Consigliati

### Collezione: `activities`

**Indice per ordinamento per data:**
- Collection ID: `activities`
- Fields indexed:
  - `data` (Ascending)
- Query scope: Collection

**Uso**: Ordinamento attività per data nel calendario e nelle tabelle presenze.

---

### Collezione: `presences`

**Indice per query per esploratore e attività:**
- Collection ID: `presences`
- Fields indexed:
  - `esploratoreId` (Ascending)
  - `attivitaId` (Ascending)
- Query scope: Collection

**Uso**: Ricerca presenza specifica per esploratore + attività (query frequente).

---

**Indice per query per attività:**
- Collection ID: `presences`
- Fields indexed:
  - `attivitaId` (Ascending)
  - `stato` (Ascending)
- Query scope: Collection

**Uso**: Filtro presenze per attività e stato (per statistiche e report).

---

**Indice per query pagamenti:**
- Collection ID: `presences`
- Fields indexed:
  - `attivitaId` (Ascending)
  - `pagato` (Ascending)
- Query scope: Collection

**Uso**: Filtro presenze per attività e stato pagamento (per pagina pagamenti).

---

### Collezione: `scouts`

**Indice per ordinamento alfabetico:**
- Collection ID: `scouts`
- Fields indexed:
  - `nome` (Ascending)
  - `cognome` (Ascending)
- Query scope: Collection

**Uso**: Ordinamento alfabetico esploratori (non critico se numero limitato, ma utile).

---

### Collezione: `audit-logs`

**Indice per ordinamento per timestamp:**
- Collection ID: `audit-logs`
- Fields indexed:
  - `timestamp` (Descending)
- Query scope: Collection

**Uso**: Visualizzazione log più recenti per primi.

---

**Indice per query per utente:**
- Collection ID: `audit-logs`
- Fields indexed:
  - `userId` (Ascending)
  - `timestamp` (Descending)
- Query scope: Collection

**Uso**: Filtro log per utente specifico (opzionale, se si vuole tracciare azioni per utente).

---

## Note Importanti

1. **Indici Compositi**: Gli indici compositi sono necessari solo quando si filtrano/ordinano su più campi contemporaneamente.

2. **Costo**: Ogni indice occupa spazio e ha un costo minimo. Per progetti piccoli (pochi MB) è trascurabile.

3. **Creazione Automatica**: Firebase può suggerire automaticamente indici mancanti quando esegui una query. Leggi i messaggi di errore nella console browser.

4. **Tempo di Creazione**: Gli indici possono richiedere alcuni minuti per essere creati, specialmente se la collezione è grande.

5. **Query Semplici**: Le query su un solo campo non richiedono indici compositi.

## Verifica Indici

Dopo aver creato gli indici, verifica che le query funzionino correttamente. Se una query fallisce, Firebase ti mostrerà un link per creare automaticamente l'indice necessario.

## Query Ottimizzate (Futuro)

Quando si implementeranno query più specifiche, considera di usare `.select()` per limitare i campi trasferiti:

```javascript
// Esempio futuro (non ancora implementato)
const activitiesSnapshot = await getDocs(
  query(collection(db, 'activities'), select('id', 'tipo', 'data', 'descrizione'))
);
```

Questo riduce la quantità di dati trasferiti e migliora le performance.

