# Fasi 4 & 5 Roadmap Completate ✅

## 1. Fase 4: Widget "Prossima Attività" & Alert Sanitario in Dashboard
- **Card Attività Imminente**:
  - Algoritmo `findUpcomingActivity`: identifica automaticamente l'attività più vicina (oggi, domani, giorni mancanti con badge dedicati e animati) o la più recente svolta nel passato.
  - KPI Presenze Confermate: progress bar dinamica con rapporto presenti/totale, assenti e non registrati.
  - KPI Quote Saldate: progress bar delle quote raccolte, importo totale riscosso, quota pro-capite e allerta pagamenti in sospeso con link rapido a `pagamenti.html`.
- **Alert di Sicurezza Sanitaria in Tempo Reale**:
  - Controllo incrociato tra i soli partecipanti presenti all'attività e lo stato medico (`san_cert_scadenza`, `consensoPrivacy`, `schedaSanitariaConsegnata`).
  - Alert box visivo in caso di certificati medici scaduti o documenti mancanti con pulsante diretto per inviare il sollecito precompilato via WhatsApp al genitore dello scout non in regola.
  - Banner rassicurante verde quando tutti i partecipanti hanno la documentazione in regola.
- **Test Unitari**:
  - `tests/next-activity-widget.test.js`: 10/10 test passati.

---

## 2. Fase 5: PWA Offline-First Avanzata & Ricerca Universale
- **Command Palette Universale (Ctrl+K)**:
  - Estesa la ricerca globale su tutte le entità dell'applicazione:
    1. **Esploratori**: ricerca su nome, cognome, squadriglia (esclude archiviati, link diretto a `esploratori.html`).
    2. **Attività**: ricerca su titolo/descrizione e tipologia (link diretto a `calendario.html`).
    3. **Staff**: ricerca su nome, cognome, email, ruolo (link diretto a `staff.html`).
    4. **Materiali & Scorte**: ricerca su nome, categoria, lista tematica, note (link diretto a `scorte.html` con indicazione scorte disponibili e unità di misura).
    5. **Scadenze**: ricerca su titolo, descrizione, categoria, anno scout con evidenza di scadenze completate (link diretto a `scadenze.html`).
  - Navigazione da tastiera completa con frecce `↑` / `↓`, `Enter` ed `Escape`.
- **Sincronizzazione a Due Vie Garantita (Online/Offline)**:
  - Coda mutazioni offline persistente in `localStorage` (`maori_offline_sync_queue`).
  - Metodi `addToOfflineQueue`, `getOfflineQueue`, `clearOfflineQueue`, `getPendingSyncCount`, `updateSyncBadge`.
  - Meccanismo `UI.syncOfflineData()` con:
    1. **Push**: esecuzione in ordine cronologico delle modifiche accumulate offline (presenze, attività, scorte, scadenze, gara reparto) verso Firebase Firestore.
    2. **Pull**: invalidazione automatica della cache, fetch dei dati aggiornati da remoto (`DATA.loadAll(true)`), riconciliazione e re-render della vista attiva.
  - Trigger automatico agli eventi `online` e probe di connettività, con toast informativo e badge di stato.
- **PWA Service Worker Aggiornato (`sw.js`)**:
  - Aggiunti alla cache offline tutti i moduli e pagine: `preventivo.html`, `gara.html`, `scorte.js`, `preventivo.js`, `gara.js`.
- **Test Unitari**:
  - `tests/command-palette.test.js`: 38/38 test passati (+9 test per Scorte e Scadenze).
  - `tests/offline-sync.test.js`: 7/7 test passati.
  - Suite complessiva: 25 file di test, **239/239 test superati**.
