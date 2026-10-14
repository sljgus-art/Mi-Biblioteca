const CACHE_NAME = "biblioteca-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALACIÓN
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  // Fuerza la activación inmediata
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

// FETCH
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        const fetchPromise = fetch(event.request)
          .then(networkResponse => {

            if (
              networkResponse &&
              networkResponse.status === 200
            ) {

              const responseClone =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(
                    event.request,
                    responseClone
                  );
                });
            }

            return networkResponse;

          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;

      })
  );
});

// PERMITE FORZAR ACTUALIZACIONES
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
