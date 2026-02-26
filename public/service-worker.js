/**
 * Service Worker for Spark ADHD PWA
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'spark-adhd-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('[Service Worker] Cache failed:', err);
      })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Take control immediately
  self.clients.claim();
});

// Fetch event - cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip non-http requests (chrome-extension, etc.)
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // API calls - network first, fallback to cache
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Static assets - cache first, fallback to network
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Cache strategies
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    // Return offline fallback if available
    return caches.match('/offline.html');
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache');
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[Service Worker] Background fetch failed:', error);
      return cached;
    });
  
  return cached || fetchPromise;
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/) ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image'
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-captures') {
    event.waitUntil(syncCaptures());
  }
});

async function syncCaptures() {
  // Sync any pending captures when coming back online
  console.log('[Service Worker] Syncing captures...');
  // Implementation would sync with CaptureService
}

// Push notifications (future)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Time to focus!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'focus-reminder',
    requireInteraction: true,
  };
  
  event.waitUntil(
    self.registration.showNotification('Spark ADHD', options)
  );
});

console.log('[Service Worker] Loaded');
