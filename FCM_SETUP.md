# Firebase Cloud Messaging (FCM) - Guida Setup

Questo documento descrive come configurare Firebase Cloud Messaging per le notifiche push nell'app.

## Configurazione Firebase Console

### 1. Genera VAPID Key

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto `presenziariomaori`
3. Vai su **Project Settings** (icona ingranaggio) → **Cloud Messaging**
4. Nella sezione **Web Push certificates**, clicca su **Generate key pair** (se non esiste già)
5. Copia la **Key pair** generata

### 2. Configura VAPID Key nel Codice

Aggiungi la VAPID key in `shared.js` nella funzione `getVapidKey()`:

```javascript
getVapidKey() {
  // Sostituisci con la tua VAPID key da Firebase Console
  return 'TUO_VAPID_KEY_QUI';
}
```

## Funzionalità Implementate

### Notifiche Attività Imminenti
- Notifica automatica 3 giorni prima di un'attività
- Controllo giornaliero automatico
- Configurabile nelle preferenze utente

### Notifiche Pagamenti Mancanti
- Notifica quando ci sono pagamenti non registrati per attività passate
- Controllo giornaliero automatico
- Configurabile nelle preferenze utente

### Notifiche Modifiche Importanti
- Notifica quando un'attività viene cancellata
- Richiede interazione utente
- Configurabile nelle preferenze utente

## Preferenze Utente

Le notifiche possono essere abilitate/disabilitate nelle preferenze:
- `notifications.enabled`: Abilita/disabilita tutte le notifiche
- `notifications.activityReminders`: Notifiche attività imminenti
- `notifications.paymentReminders`: Notifiche pagamenti mancanti
- `notifications.importantChanges`: Notifiche modifiche importanti

## Permessi Browser

Le notifiche richiedono il permesso dell'utente. L'app richiede automaticamente il permesso al primo caricamento (se non già concesso).

Per testare manualmente:
1. L'app inizializza FCM automaticamente al login
2. Il browser chiederà il permesso per le notifiche
3. Se accettato, il token FCM viene salvato in Firestore

## Service Worker

Il file `firebase-messaging-sw.js` gestisce:
- Messaggi in background (quando l'app è chiusa)
- Click sulle notifiche (apertura app alla pagina specificata)

## Note Importanti

⚠️ **VAPID Key Necessaria**: Senza VAPID key configurata, FCM non funzionerà. La funzione `getVapidKey()` restituisce `null` di default.

⚠️ **HTTPS Richiesto**: Le notifiche push funzionano solo su HTTPS (o localhost per sviluppo).

⚠️ **Service Worker**: Assicurati che `firebase-messaging-sw.js` sia accessibile alla root del sito.

## Testing

1. Configura la VAPID key
2. Carica l'app su HTTPS (o localhost)
3. Fai login
4. Accetta i permessi notifiche
5. Verifica nella console che il token FCM venga ottenuto
6. Controlla che le notifiche funzionino (attività imminenti, pagamenti, etc.)

## Troubleshooting

**Token non ottenuto**:
- Verifica che la VAPID key sia configurata correttamente
- Controlla che il service worker sia registrato correttamente
- Verifica i permessi notifiche nel browser

**Notifiche non ricevute**:
- Verifica che le preferenze utente consentano le notifiche
- Controlla che le condizioni per le notifiche siano soddisfatte
- Verifica i log della console per errori

