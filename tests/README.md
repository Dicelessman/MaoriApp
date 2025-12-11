# Test Suite

Questa directory contiene i test per l'applicazione MaoriApp.

## Setup

1. Installa le dipendenze:
```bash
npm install
```

2. Esegui i test:
```bash
npm test          # Run una volta
npm run test:watch # Watch mode
npm run test:ui    # UI interattiva
```

## Struttura Test

- `utils.test.js` - Test per funzioni utility pure
- `validation.test.js` - Test per funzioni di validazione
- `data-adapter.test.js` - Test per LocalAdapter (mock localStorage)

## Coverage

Target: 70% coverage per codice critico

## Principi

- Test isolati: ogni test deve essere indipendente
- Test veloci: test unitari devono essere rapidi
- Test deterministici: stesso input = stesso output
- Mock esterni: Firebase, DOM, localStorage sono mockati

