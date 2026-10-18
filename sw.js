"use strict";

const CACHE_VERSION = "market-journal-v6";
const APP_SHELL = [
  "./",
  "./index.html",
  "./macro-dashboard.js",
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
            key.startsWith("market-journal-") &&
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
