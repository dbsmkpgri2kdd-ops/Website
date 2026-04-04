/**
 * SMK PRIDA Service Worker v7.6
 * Menangani update otomatis dan aktivasi cepat dengan cache versioning.
 */
const CACHE_NAME = 'smk-prida-cache-v7.6';
const STATIC_CACHE = 'smk-prida-static-v7.6';

// File yang akan di-cache untuk offline access
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version');
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_FILES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version');
  event.waitUntil(
    Promise.all([
      // Claim all clients immediately
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  // Handle static files
  if (STATIC_FILES.includes(event.request.url.replace(self.location.origin, ''))) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Network first strategy for dynamic content
  event.respondWith(
    fetch(event.request).then(response => {
      // Cache successful responses
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Fallback to cache
      return caches.match(event.request);
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
