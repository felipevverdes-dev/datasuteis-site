const CLEANUP_MESSAGE_TYPE = "datasuteis-sw-cleanup-complete";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(cacheKey => caches.delete(cacheKey)));

      await self.clients.claim();
      const windowClients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });

      await self.registration.unregister();

      await Promise.all(
        windowClients.map(async client => {
          client.postMessage({ type: CLEANUP_MESSAGE_TYPE });

          if ("navigate" in client) {
            try {
              await client.navigate(client.url);
            } catch {
              // Ignore refresh failures; the client can recover on next navigation.
            }
          }
        })
      );
    })()
  );
});
