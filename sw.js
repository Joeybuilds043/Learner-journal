"use strict";

const CACHE_VERSION = "marketpulse-v31";
const APP_SHELL = [
  "./",
  "./index.html",
  "./marketscope-mark.svg",
  "./macro-dashboard.js?v=20261031-marketpulse-v10",
  "./marketpilot-config.js?v=20261031-provider-routing-v1",
  "./ai-workspace.js?v=20261031-analyst-markdown-v13",
  "./assets/candledesk-mark.svg",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install: save the core app files for offline use.
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(APP_SHELL);
      await self.skipWaiting();
    })()
  );
});

// Activate: remove old versions of this app's cache.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) =>
            (key.startsWith("marketscope-") || key.startsWith("market-journal-") || key.startsWith("marketpulse-")) &&
            key !== CACHE_VERSION
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// Fetch: prefer fresh HTML, with an offline fallback.
// Other local app files can be served from cache.
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept external websites or resources.
  if (url.origin !== self.location.origin) return;

  // Always try the network for the live macro dashboard first. Older installed
  // copies must not keep using a stale API URL just because a cached script exists.
  if (url.pathname.endsWith("/macro-dashboard.js") || url.pathname.endsWith("/ai-workspace.js") || url.pathname.endsWith("/marketpilot-config.js")) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request, { cache: "no-store" });
          if (response.ok && response.type === "basic") {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await caches.match(request);
          if (cached) return cached;
          return Response.error();
        }
      })()
    );
    return;
  }

  // Handle page navigation separately.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put("./index.html", response.clone());
          }

          return response;
        } catch (error) {
          return (
            await caches.match(request) ||
            await caches.match("./index.html") ||
            Response.error()
          );
        }
      })()
    );

    return;
  }

  // Cache-first for local static assets.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return Response.error();
      }
    })()
  );
});
