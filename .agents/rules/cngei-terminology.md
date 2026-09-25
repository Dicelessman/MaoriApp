# Regola di Progetto: Terminologia Scout CNGEI

Questo progetto appartiene a un'unità del **CNGEI** (Corpo Nazionale Giovani Esploratori ed Esploratrici Italiani).
In tutte le interfacce, etichette, testi, placeholder, commenti, logiche di visualizzazione ed esportazioni CSV/PDF, **NON** deve essere usata la terminologia AGESCI, bensì la corretta terminologia associativa **CNGEI**.

---

## 1. Mappatura Terminologica Fondamentale

| Termine NON da usare (AGESCI o generico) | Termine UFFICIALE CNGEI | Abbreviazione CNGEI | Note e Contesto |
| :--- | :--- | :--- | :--- |
| **Squadriglia** | **Pattuglia** | **Ptg.** (MAI "Sq.") | Unità base della branca E/E |
| **Squadriglie** | **Pattuglie** | **Ptg.** | Plurale |
| **Capo Squadriglia** | **Capo Pattuglia** | **CP** | Scout che guida la pattuglia |
| **Vice Capo Squadriglia** | **Vice Capo Pattuglia** | **VCP** | Scout vice-responsabile |
| **Consiglio di Squadriglia** | **Consiglio di Pattuglia** | - | Riunione della sola pattuglia |
| **Angolo di Squadriglia** | **Angolo di Pattuglia** | - | Spazio della pattuglia in sede/campo |
| **Cassa di Squadriglia** | **Cassa di Pattuglia** | - | Cassa materiali della pattuglia |
| **Impresa di Squadriglia** | **Impresa di Pattuglia** | - | Progetto ideato e realizzato dalla pattuglia |
| **Grido di Squadriglia** | **Grido di Pattuglia** | - | Motto e richiamo della pattuglia |
| **Gara tra Squadriglie** | **Gara di Reparto** | - | Competizione periodica di reparto |

---

## 2. Struttura delle Branche CNGEI

1. **Branca Lupetti (L)**: 8 - 12 anni
   - Unità: **Branco** (non "Cerchio")
   - Sotto-unità: **Sestiglie** (Colori: Neri, Bianchi, Pezzati, Rossi, Grigi, Bruni)
   - Capi: Vecchi Lupi (Akela, Baloo, Bagheera, Kaa, ecc.)
2. **Branca Esploratori (E)**: 12 - 16 anni
   - Unità: **Reparto** (laico e coeducativo)
   - Sotto-unità: **Pattuglie** (nomi di animali: Aironi, Marmotte, Volpi, Aquile, Lupi, Puma, ecc.)
   - Ruoli ragazzi: **CP** (Capo Pattuglia), **VCP** (Vice Capo Pattuglia)
   - Progressione: **Sentiero** (Sfide, Promessa, Giglio e Trifoglio dell'Impegno), **Specialità** (Prove, Specialità, Specialità di Pattuglia, Specialista)
   - Capi: **CR** (Capo Reparto), **VCR** (Vice Capo Reparto)
3. **Branca Rover (R)**: 16 - 19 anni
   - Unità: **Compagnia** (non "Noviziato/Clan")
   - Progressione: Cammino, Servizio, Partenza
4. **Adulti**:
   - Capi Unità, Vice Capi, Capi Gruppo, Senior (Clan Senior)

---

## 3. Direttive per il Codice (UI, Modelli, Test)

- Nei file HTML, JS, CSS, testi a schermo e stampe: usare **"Pattuglia"** (singolare), **"Pattuglie"** (plurale) e l'abbreviazione **"Ptg."**.
- Nelle intestazioni di tabelle o esportazioni CSV: usare la colonna `"Pattuglia"` (anziché `"Squadriglia"`).
- Nei dati / modelli (backward-compatibility): se esistono campi database legacy chiamati `squadriglia` o `pv_pattuglia`, supportare entrambi in lettura/scrittura (`entry.pattuglia || entry.squadriglia`), esponendo sempre `"Pattuglia"` all'utente.
- Nelle regole di sicurezza Firestore: consentire `pattuglia` e `squadriglia` per non bloccare record storici.
