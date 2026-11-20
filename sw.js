const CACHE = "product-studio-ai-v55-sidebar-20261120a";
const FILES = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg", "/cloud-library.js?v=cloud-resume-20261120a", "/app-navigation.js?v=sidebar-20261120a"];

self.addEventListener("install", event => event.waitUntil(
  caches.open(CACHE)
    .then(cache => cache.addAll(FILES))
    .then(() => self.skipWaiting())
));

self.addEventListener("activate", event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys
      .filter(key => key.startsWith("product-studio-ai-") && key !== CACHE)
      .map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache authenticated API responses or user-specific data.
  if (url.pathname.startsWith("/api/")) return;

  // Keep navigation fresh, with an offline fallback to the app shell.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put("/index.html", copy));
      }
      return response;
    }).catch(() => caches.match("/index.html")));
    return;
  }

  // Cache only successful static GET responses; prefer the network when online.
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match("/index.html"))));
});
