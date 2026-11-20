const CACHE = "product-studio-ai-v64-bilingual-account-history-20261120";
const FILES = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg?v=brand-icon-20261120", "/cloud-library.js?v=cloud-button-state-20261120a", "/app-navigation.js?v=prompt-accordion-20261120a", "/i18n.js?v=sk-en-1"];

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
  if (url.pathname.startsWith("/api/")) return;

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

  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match("/index.html"))));
});