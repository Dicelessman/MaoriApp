# Batch Operations - Documentazione Implementazione

## Panoramica
Sistema di selezione multipla e azioni batch per la pagina presenze.

## Funzionalità Implementate

### 1. Selezione Multipla
- Checkbox per ogni riga esploratore
- Checkbox "Seleziona tutti" nell'header
- Contatore elementi selezionati
- Selezione persistente durante rendering

### 2. Barra Azioni Batch
- Appare quando ci sono elementi selezionati
- Azioni disponibili:
  - **Segna Presenti**: Marca tutti gli esploratori selezionati come "Presente" per attività selezionata
  - **Segna Assenti**: Marca tutti gli esploratori selezionati come "Assente" per attività selezionata
  - **Applica Pagamento**: Applica pagamento a tutti gli esploratori selezionati per attività selezionata
  - **Esporta Selezionati**: Esporta CSV con solo gli esploratori selezionati

### 3. Progress Indicator
- Barra di progresso durante operazioni batch
- Messaggio di stato
- Annullabile per operazioni lunghe

## Struttura Codice

### UI State
```javascript
UI.batchSelection = {
  selectedScoutIds: Set<string>, // ID esploratori selezionati
  selectedActivityId: string | null, // Attività per azioni batch
  isSelectAll: boolean
}
```

### Funzioni Principali
- `setupBatchOperations()`: Inizializza sistema batch
- `toggleBatchSelection(scoutId)`: Toggle selezione esploratore
- `toggleSelectAll()`: Toggle selezione tutti
- `clearBatchSelection()`: Pulisce selezione
- `executeBatchAction(action, activityId)`: Esegue azione batch
- `updateBatchActionBar()`: Aggiorna UI barra azioni

