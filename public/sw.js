
/**
 * SMKS PGRI 2 KEDONDONG - PWA Service Worker
 * Memastikan kriteria instalasi PWA di Android terpenuhi.
 */

const CACHE_NAME = 'prida-portal-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Biarkan browser menangani fetch standar
  // Di masa depan, tambahkan strategi caching di sini untuk offline mode
});
