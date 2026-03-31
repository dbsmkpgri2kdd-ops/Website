/**
 * PRIDA PWA Service Worker v1.0
 * Handles auto-updates and basic caching for static assets.
 */

const CACHE_NAME = 'prida-cache-v1';

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Ensure that updates to the service worker take effect immediately
  event.waitUntil(clients.claim());
  
  // Clean up old caches if any
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network first, fallback to cache for static export readiness
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
