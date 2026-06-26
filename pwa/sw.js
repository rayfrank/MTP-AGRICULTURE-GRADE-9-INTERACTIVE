/* ── MTP Digital Service Worker ─────────────────────────────── */
const CACHE_NAME = "agri-nutrition-v2";
const APP_ROOT = new URL("../", self.location.href);

// Files cached immediately on install (app shell)
const PRECACHE = [
  "index.html",
  "styles/styles.css",
  "scripts/app.js",
  "scripts/book-data.js",
  "scripts/three-scenes.js",
  "assets/three.cjs",
  "assets/book.pdf",
  "media/mtplogo.png",
  "icons/icon.svg",
  "pwa/manifest.json",
].map((path) => new URL(path, APP_ROOT).href);

// ── Install: precache app shell ───────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll is all-or-nothing; catch so a missing optional file doesn't
      // block installation (e.g. mtplogo.png if not yet uploaded)
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: delete stale caches ────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for shell, network-first for PDF ──────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Network-first for the PDF (large; may be updated independently)
  if (url.pathname.endsWith(".pdf")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else — serve instantly, update cache in background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return response;
      }).catch(() => null);

      return cached || networkFetch;
    })
  );
});

// ── Message: force skip-waiting when client asks ─────────────
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
