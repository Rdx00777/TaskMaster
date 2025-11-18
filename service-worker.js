const CACHE_NAME = 'revtrack-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// install event: cache shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
});

// activate
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// fetch: try cache first, else network, then cache
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkRes => {
        // cache fetched file for offline next time (only if status 200)
        try {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
        } catch (e) { /* ignore */ }
        return networkRes;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// optional: cleanup old caches (not required now)
