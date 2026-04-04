const CACHE_NAME = 'easytv-static-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=20260404b',
  './app.js?v=20260404b',
  './error-handler.js?v=20260404b',
  './premium-system.js?v=20260404b',
  './dynamic-theme.js?v=20260404b',
  './akira-font.css',
  './raleway-font.css',
  './manifest.webmanifest',
  './assets/EasyTVLogo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => Promise.resolve())
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
