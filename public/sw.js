const CACHE_NAME = "oskost-tenant-cache-v1";
const OFFLINE_URL = "/offline.html";

// Assets to cache immediately
const ASSETS_TO_CACHE = [
  "/favicon.ico",
  "/images/pwa-icon.png",
  OFFLINE_URL
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache core assets
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // For navigate requests (HTML pages), try network first, fallback to cache/offline page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL) || Response.error();
      })
    );
    return;
  }

  // Stale-while-revalidate for static assets (js, css, images, fonts)
  const isStaticAsset = 
    event.request.url.includes("/_next/static/") ||
    event.request.url.includes("/images/") ||
    event.request.url.includes("/fonts/") ||
    event.request.url.endsWith(".js") ||
    event.request.url.endsWith(".css") ||
    event.request.url.endsWith(".png") ||
    event.request.url.endsWith(".ico") ||
    event.request.url.endsWith(".woff2");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Ignore network errors for static files
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default strategy: Network first
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
