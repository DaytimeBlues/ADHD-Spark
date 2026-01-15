const STATIC_CACHE = 'spark-static-v1';
const RUNTIME_CACHE = 'spark-runtime-v1';
const GOOGLE_CACHE = 'spark-google-v1';
const ALLOWED_CACHES = [STATIC_CACHE, RUNTIME_CACHE, GOOGLE_CACHE];

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => !ALLOWED_CACHES.includes(key))
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // NetworkFirst for Google API requests with cache fallback
    if (
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('googleusercontent.com')
    ) {
        event.respondWith(networkFirst(request, GOOGLE_CACHE));
        return;
    }

    // NetworkFirst for HTML documents to prevent stale app versions
    if (request.destination === 'document') {
        event.respondWith(networkFirst(request, RUNTIME_CACHE));
        return;
    }

    // StaleWhileRevalidate for scripts and styles
    if (request.destination === 'script' || request.destination === 'style') {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
        return;
    }

    // CacheFirst for static assets (images/fonts)
    if (request.destination === 'image' || request.destination === 'font') {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }
});

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    const response = await fetch(request);
    if (response && response.ok) {
        cache.put(request, response.clone());
    }
    return response;
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedPromise = cache.match(request);
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response && response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cachedPromise);

    const cachedResponse = await cachedPromise;
    return cachedResponse || fetchPromise;
}

async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
}
