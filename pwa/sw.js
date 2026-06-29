/* ── MTP Digital Service Worker ─────────────────────────────── */
const CACHE_NAME = "agri-nutrition-v17";
const APP_ROOT = new URL("../", self.location.href);

// Files cached immediately on install (app shell)
const PRECACHE = [
  "index.html",
  "styles/styles.css",
  "scripts/app.js",
  "scripts/book-data.js",
  "scripts/three-scenes.js",
  "scripts/qr.js",
  "assets/three.cjs",
  "assets/webllm/webllm.js",
  "assets/webllm/SmolLM2-360M-Instruct-q4f16_1_cs1k-webgpu.wasm",
  "assets/transformers/transformers.min.js",
  "assets/transformers/ort-wasm-simd-threaded.jsep.js",
  "assets/transformers/ort-wasm-simd-threaded.jsep.wasm",
  "assets/book.pdf",
  "media/mtplogo.png",
  "media/videos/hay-rake.webm",
  "media/videos/leftovers-refrigerate.webm",
  "media/videos/composting-basics.webm",
  "media/videos/grain-bins.webm",
  "media/videos/flour-mixing.webm",
  "media/videos/cleaning-toilet.webm",
  "media/videos/hand-washing-laundry.webm",
  "media/videos/plant-grafting.webm",
  "media/videos/solar-heat.webm",
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

  // Video elements request byte ranges. Build a 206 response from the
  // fully precached file so playback and seeking continue while offline.
  if (url.pathname.includes("/media/videos/") && event.request.headers.has("range")) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      let response = await cache.match(url.href, { ignoreVary: true });
      if (!response) {
        response = await fetch(url.href);
        if (response.ok) await cache.put(url.href, response.clone());
      }

      const bytes = await response.arrayBuffer();
      const range = event.request.headers.get("range") || "bytes=0-";
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      const start = match ? Number(match[1]) : 0;
      const requestedEnd = match?.[2] ? Number(match[2]) : bytes.byteLength - 1;
      const end = Math.min(requestedEnd, bytes.byteLength - 1);

      if (start >= bytes.byteLength || start > end) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${bytes.byteLength}` },
        });
      }

      const headers = new Headers(response.headers);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Range", `bytes ${start}-${end}/${bytes.byteLength}`);
      headers.set("Content-Length", String(end - start + 1));
      headers.set("Content-Type", response.headers.get("Content-Type") || "video/webm");

      return new Response(bytes.slice(start, end + 1), { status: 206, headers });
    })());
    return;
  }

  // The model runtimes manage their own caches. Avoid storing a second large
  // copy in the app-shell cache while either SmolLM2 model is initialized.
  if (url.pathname.includes("/assets/models/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Always check for fresh HTML, JavaScript, and CSS while online so a newly
  // deployed AI/runtime fix is not hidden behind yesterday's app-shell cache.
  // The cached copy remains the fallback when the device is offline.
  if (event.request.mode === "navigate" || /\.(?:html|js|css)$/.test(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

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
