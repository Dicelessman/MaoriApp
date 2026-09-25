# Guida e Corrispondenze Terminologiche Scout CNGEI

Questo progetto (**MaoriApp**) è sviluppato per un'unità del **CNGEI** (Corpo Nazionale Giovani Esploratori ed Esploratrici Italiani).

A differenza di altre associazioni scout italiane (come l'AGESCI), il CNGEI adotta una precisa nomenclatura storica e statutaria che deve essere rigorosamente rispettata in tutta l'applicazione (interfaccia utente, stampe cartacee, esportazioni, schede sanitarie, tabelloni di gara e codice sorgente).

---

## Tabella delle Corrispondenze Principali

| Terminologia da NON usare (AGESCI o non corretta) | Terminologia UFFICIALE CNGEI | Sigla / Abbreviazione CNGEI | Note e Utilizzo |
| :--- | :--- | :--- | :--- |
| **Squadriglia** | **Pattuglia** | **Ptg.** | Unità base dei ragazzi/e in Reparto |
| **Squadriglie** | **Pattuglie** | **Ptg.** | Plurale |
| **Sq.** | **Ptg.** | **Ptg.** | Sigla grafica/testuale corretta |
| **Capo Squadriglia** | **Capo Pattuglia** | **CP** | Esploratore/trice alla guida della pattuglia |
| **Vice Capo Squadriglia** | **Vice Capo Pattuglia** | **VCP** | Secondo responsabile della pattuglia |
| **Consiglio di Squadriglia** | **Consiglio di Pattuglia** | - | Riunione decisionale della sola pattuglia |
| **Angolo di Squadriglia** | **Angolo di Pattuglia** | - | Spazio assegnato alla pattuglia in sede/campo |
| **Cassa di Squadriglia** | **Cassa di Pattuglia** | - | Cassa materiali ed attrezzi di pattuglia |
| **Impresa di Squadriglia** | **Impresa di Pattuglia** | - | Progetto ideato, realizzato e verificato dalla pattuglia |
| **Grido di Squadriglia** | **Grido di Pattuglia** | - | Richiamo caratteristico della pattuglia |
| **Gara tra Squadriglie** | **Gara tra Pattuglie** | - | Competizione periodica di reparto |

---

## Branche del CNGEI

1. **Branca Lupetti (L)** — 8/12 anni:
   - **Branco** (non "Cerchio")
   - Sotto-unità: **Sestiglie** (Colori: Neri, Bianchi, Pezzati, Rossi, Grigi, Bruni)
   - Capi: Vecchi Lupi (Akela, Baloo, Bagheera, Kaa, ecc.)
2. **Branca Esploratori ed Esploratrici (E/E)** — 12/16 anni:
   - **Reparto** (laico e coeducativo)
   - Sotto-unità: **Pattuglie** (nomi di animali: Aironi, Marmotte, Volpi, Aquile, Lupi, ecc.)
   - Ruoli: **CP** (Capo Pattuglia), **VCP** (Vice Capo Pattuglia)
   - Progressione: **Sentiero** (Prove, Sfide, Specialità, Brevetti di Pattuglia)
3. **Branca Rover (R)** — 16/19 anni:
   - **Compagnia** (non "Noviziato/Clan")
   - Progressione: Cammino, Servizio, Partenza
4. **Adulti**:
   - Capi Unità, Vice Capi, Coordinatori di Gruppo, Senior (Clan Senior)

---

## Linee Guida di Sviluppo

- **Etichette UI & Stampe**: Usare sempre `Pattuglia` / `Pattuglie` e `Ptg.`.
- **Esportazioni CSV**: Usare intestazioni con `"Pattuglia"` (e non `"Squadriglia"`).
- **Compatibilità Dati**: A livello di modello/database, supportare sia `pattuglia` che `squadriglia` per preservare lo storico dei dati esistenti.
