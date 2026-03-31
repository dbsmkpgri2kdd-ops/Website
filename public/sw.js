
/**
 * SMKS PGRI 2 KEDONDONG - PWA Service Worker v1.0
 * Essential for Android Install Notification (A2HS).
 */

const CACHE_NAME = 'prida-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://picsum.photos/seed/logo/192/192',
  'https://picsum.photos/seed/logo/512/512'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
