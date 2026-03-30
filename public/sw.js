
/**
 * Service Worker Minimal untuk Kriteria PWA Android SMKS PGRI 2 Kedondong.
 */
const CACHE_NAME = 'prida-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Biarkan browser menangani fetch secara normal untuk mode static export.
  // Ini hanya untuk memenuhi syarat installability PWA.
  return;
});
