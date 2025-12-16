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

### Fase 2: Convertire Moduli Utility (✅ Completato)
I seguenti file sono stati convertiti in `.ts`:

1. **`utils.ts`** ✅
   - Funzioni pure tipizzate
   - Type definitions per parametri e return types

2. **`validation.ts`** ✅
   - Logica di validazione tipizzata
   - Union types per stati validazione
   - Type guards per Activity types

3. **`constants.ts`** ✅
   - Costanti tipizzate con `as const`
   - Type exports per literal types

4. **`types.d.ts`** ✅
   - Type definitions centralizzate per tutte le entità
   - Interfacce per Scout, Staff, Activity, Presence, Comment, etc.
   - Tipi per stato applicazione, preferenze, export/import

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

## File TypeScript Creati

### 1. `types.d.ts` ✅
Type definitions centralizzate per tutte le entità:
- `Scout`, `Staff`, `Activity`, `Presence` - Entità principali
- `Comment`, `ActivityTemplate`, `InAppNotification` - Nuove entità
- `AppState`, `UserPreferences`, `ExportData` - Strutture dati
- `ValidationResult`, `EmailValidationResult` - Tipi validazione
- Helper types: `PartialBy`, `RequiredBy`

### 2. `validation.ts` ✅
Funzioni di validazione completamente tipizzate:
- Type guards per `isValidActivityType`
- Tipi per parametri e return values
- Import da `types.d.ts` per interfacce

### 3. `constants.ts` ✅
Costanti tipizzate con `as const`:
- Literal types per `PRESENCE_STATES`, `PAYMENT_TYPES`, `ACTIVITY_TYPES`
- Type exports per uso in altri moduli
- Collezioni Firestore aggiornate con nuove collezioni

### 4. `utils.ts` ✅
Già esistente, funzioni utility tipizzate

## Prossimi Passi

1. ✅ Type definitions centralizzate - Completato
2. ✅ Moduli utility convertiti - Completato  
3. ⏭️ Type definitions per moduli JS esistenti (`shared.d.ts`)
4. ⏭️ Graduale conversione file principali quando necessario

## Uso dei Tipi

I tipi possono essere importati in file TypeScript:

```typescript
import type { Scout, Activity, AppState } from './types.js';
import { validateScout, validateActivity } from './validation.js';
import { ACTIVITY_TYPES, type ActivityType } from './constants.js';
```

Per file JavaScript esistenti, i tipi forniscono IntelliSense se l'editor supporta TypeScript.

