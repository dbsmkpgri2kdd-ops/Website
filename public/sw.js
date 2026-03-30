
/**
 * PRIDA Digital Hub - Service Worker v1.0
 * Syarat wajib agar PWA dapat diinstal di Android.
 */

const CACHE_NAME = 'prida-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  'https://picsum.photos/seed/logo/192/192'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
