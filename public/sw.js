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

// ============================================
// Web Push Notifications Event Listeners
// ============================================

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "OsKost";
    const options = {
      body: data.message || "",
      icon: "/images/pwa-icon.png",
      badge: "/images/pwa-icon.png",
      data: {
        url: data.url || "/dashboard",
      },
    };

    // 1. Tampilkan notifikasi push di layar HP
    // 2. Broadcast ke semua tab PWA yang terbuka agar otomatis auto-refresh data
    event.waitUntil(
      Promise.all([
        self.registration.showNotification(title, options),
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          clientList.forEach((client) => {
            client.postMessage({ type: "PUSH_NOTIFICATION_RECEIVED", data });
          });
        }),
      ])
    );
  } catch (error) {
    console.error("Error displaying push notification:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.postMessage({ type: "NOTIFICATION_CLICKED", url: urlToOpen });
          if (client.url.includes(urlToOpen)) {
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
