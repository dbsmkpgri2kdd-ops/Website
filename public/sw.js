/**
 * Service Worker SMKS PGRI 2 KEDONDONG v7.5
 * Optimal untuk Update Otomatis & Caching Statis.
 */

const CACHE_NAME = 'smk-prida-cache-v7.5';

// Daftar aset untuk caching awal (optional untuk static export)
const urlsToCache = [
  '/',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  // Langsung aktifkan SW baru tanpa menunggu tab ditutup
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Ambil alih kendali semua klien segera
  event.waitUntil(clients.claim());
  
  // Bersihkan cache lama jika ada perubahan versi
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
});

self.addEventListener('fetch', (event) => {
  // Strategi: Network First, falling back to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
