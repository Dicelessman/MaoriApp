const CACHE_NAME = "presenziario-cache-v6"; // bump cache v6
const RUNTIME_CACHE = "presenziario-runtime-v2";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  // Pagine principali
  "/presenze.html",
  "/dashboard.html",
  "/calendario.html",
  "/esploratori.html",
  "/staff.html",
  "/audit-logs.html",
  "/statistiche.html",
  "/liste.html",
  "/pagamenti.html",
  "/documenti.html",
  "/preferenze.html",
  "/attivita.html",
  "/scout2.html",
  "/archivio.html",
  "/scadenze.html",
  // Shared & modals
  "/shared.html",
  "/modals.html",
  // Stili e config
  "/style.css",
  "/manifest.json",
  "/config.js",
  // JS pagine
  "/shared.js",
  "/date-picker.js",
  "/presenze.js",
  "/dashboard.js",
  "/calendario.js",
  "/esploratori.js",
  "/staff.js",
  "/audit-logs.js",
  "/statistiche.js",
  "/liste.js",
  "/pagamenti.js",
  "/documenti.js",
  "/preferenze.js",
  "/attivita.js",
  "/scout2.js",
  "/archivio.js",
  "/scadenze.js",
  // Moduli core JS
  "/js/core/firebase.js",
  "/js/utils/constants.js",
  "/js/utils/utils.js",
  "/js/utils/validation.js",
  "/js/ui/ui.js",
  "/js/data/data-facade.js",
  "/js/data/adapters/firestore-adapter.js",
  "/js/data/adapters/local-adapter.js",
  // Icone e asset
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  // Dati statici
  "/challenges.json",
  "/specialita.json"
];

// Install: cache preconfigured, poi skipWaiting per attivazione immediata
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        URLS_TO_CACHE.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] Failed to cache ${url}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting()) // Attiva subito il nuovo SW
  );
});

// Activate: pulisce le cache obsolete e prende controllo di tutte le tab
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME && n !== RUNTIME_CACHE)
          .map(n => {
            console.info(`[SW] Removing old cache: ${n}`);
            return caches.delete(n);
          })
      )
    ).then(() => self.clients.claim()) // Prende controllo immediato di tutte le tab
  );
});

// Fetch: Stale-While-Revalidate per asset statici e HTML
self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Solo GET e stessa origine
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await caches.match(request);
    const fetchPromise = fetch(request)
      .then(async (networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          try { await cache.put(request, networkResponse.clone()); } catch (e) { }
        }
        return networkResponse;
      })
      .catch(() => cached);

    // Risponde subito con la cache se disponibile, aggiorna in background
    return cached || fetchPromise;
  })());
});
