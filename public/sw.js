/**
 * Service Worker ExamBro & Digital Hub v5.5
 * Strategi: Skip Waiting & Clients Claim untuk Update Otomatis PWA.
 */

const CACHE_NAME = 'prida-pwa-cache-v7.5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for Static Export compatibility
  event.respondWith(fetch(event.request));
});