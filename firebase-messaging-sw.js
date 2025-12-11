// firebase-messaging-sw.js - Service Worker per Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

// Firebase configuration (same as in shared.js)
const firebaseConfig = {
  apiKey: "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4",
  authDomain: "presenziariomaori.firebaseapp.com",
  projectId: "presenziariomaori",
  storageBucket: "presenziariomaori.firebasestorage.app",
  messagingSenderId: "556210165397",
  appId: "1:556210165397:web:4f434e78fb97f02d116d9c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Notifica Scout Maori';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nuova notifica',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'default',
    requireInteraction: payload.data?.requireInteraction === 'true',
    data: payload.data || {}
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // Open app to specific page if URL is provided
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

