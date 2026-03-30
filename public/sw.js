
/**
 * Minimal Service Worker untuk SMKS PGRI 2 Kedondong PWA.
 * Diperlukan agar notifikasi 'Add to Home Screen' muncul di Android.
 */

const CACHE_NAME = 'prida-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Mode Pass-through untuk kompatibilitas Next.js Static Export
  event.respondWith(fetch(event.request));
});
