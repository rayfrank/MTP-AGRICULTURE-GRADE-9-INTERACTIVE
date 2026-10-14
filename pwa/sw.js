/* ── Retired service worker location ──────────────────────────
   The service worker now lives at /sw.js so that it can control the whole
   app. Browsers that registered this older copy (whose scope was limited to
   /pwa/) remove it on their next visit. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.registration.unregister());
});
