# Migrazione TypeScript Incrementale

Questo documento descrive la strategia di migrazione incrementale a TypeScript.

## Setup Completato

- ✅ `tsconfig.json` configurato con `allowJs: true` per migrazione graduale
- ✅ TypeScript installato come dev dependency
- ✅ Script `npm run type-check` per verificare tipi senza build
- ✅ Compatibilità JavaScript mantenuta durante la migrazione

## Strategia di Migrazione

### Fase 1: Type-Check Solo (Corrente)
- ✅ Configurazione TypeScript con `noEmit: true`
- ✅ Type-checking senza generare file JS
- ✅ Compatibilità con build esistente

### Fase 2: Convertire Moduli Utility (Prossimo)
I seguenti file possono essere convertiti in `.ts` per primi (low risk):

1. **`utils.js` → `utils.ts`**
   - Funzioni pure
   - Nessuna dipendenza da Firebase/DOM complessi
   - Facile da tipizzare

2. **`validation.js` → `validation.ts`**
   - Logica di validazione isolata
   - Facile da tipizzare con union types per stati validazione

3. **`constants.js` → `constants.ts`**
   - Solo costanti
   - Facile da tipizzare con `as const`

### Fase 3: Type Definitions per Moduli Esistenti
Creare file `.d.ts` per moduli JS esistenti:

- `shared.d.ts` - Type definitions per `shared.js`
- `firebase.d.ts` - Type definitions per Firebase (se non già presenti)

### Fase 4: Convertire File Principali (Futuro)
Dopo aver tipizzato i moduli utility:

- Convertire `shared.js` in moduli più piccoli
- Aggiungere tipi progressivamente
- Mantenere compatibilità durante la conversione

## Comandi Disponibili

```bash
# Verifica tipi senza build
npm run type-check

# Verifica tipi in watch mode
npm run type-check:watch

# Build normale (non influenzato da TypeScript)
npm run build
```

## Principi

1. **Nessun Breaking Change**: La migrazione non deve rompere funzionalità esistenti
2. **Incrementale**: Convertire un file alla volta
3. **Compatibilità**: Mantenere `.js` durante la migrazione
4. **Type Safety Graduale**: Iniziare con `strict: false`, aumentare gradualmente

## Note

- Il build attuale (`build-config.js`) non è influenzato da TypeScript
- TypeScript viene usato solo per type-checking durante sviluppo
- I file `.ts` possono coesistere con `.js` grazie a `allowJs: true`

