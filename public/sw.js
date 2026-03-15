/**
 * Thimbl Service Worker
 *
 * Provides offline caching for the app shell and static assets.
 * Strategies:
 * - Cache-first for static assets (JS, CSS, fonts, icons)
 * - Network-first for HTML pages (always try fresh content)
 * - Stale-while-revalidate for images
 */

const CACHE_NAME = 'thimbl-v1';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/explore',
  '/my-projects',
  '/shopping-list',
  '/achievements',
  '/profile',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install — pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Don't fail install if some URLs can't be cached
        console.warn('Pre-cache failed for some URLs:', err);
      });
    })
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch — apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls — always go to network
  if (url.hostname.includes('supabase.co')) return;

  // Skip chrome-extension and other non-http(s) URLs
  if (!url.protocol.startsWith('http')) return;

  // Strategy 1: Cache-first for static assets (Next.js hashed files)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-while-revalidate for images
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/placeholders/') ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached); // Fallback to cache if network fails

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Strategy 3: Network-first for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
