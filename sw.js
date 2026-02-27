// Service Worker for PWA
const CACHE_NAME = 'promptfolio-v4';
const urlsToCache = [
  '/promptfolio/',
  '/promptfolio/index.html',
  '/promptfolio/css/main.css',
  '/promptfolio/css/responsive.css',
  '/promptfolio/js/app.js',
  '/promptfolio/js/gallery.js',
  '/promptfolio/js/modal.js',
  '/promptfolio/favicon.svg'
];

// Install event - cache resources
self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - Network first for JSON, cache for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Always fetch fresh data for images.json
  if (url.pathname.includes('images.json')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Cache first for static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
