// ================================
// SERVICE WORKER – PORTALE FARMACIA MONTESANO
// Cache base per lavorare anche offline
// ================================

const CACHE_NAME = "fm-cache-v1";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./logo-192.png",
  "./logo-512.png"
];

// Install: metto in cache i file base
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: pulisco vecchie cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: prima prova la rete, se non va prendi dalla cache
self.addEventListener("fetch", event => {
  const req = event.request;

  // solo GET (niente POST, ecc.)
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then(res => {
        // se la risposta è ok, aggiorno cache
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone);
        });
        return res;
      })
      .catch(() => {
        // se offline / errore → prova la cache
        return caches.match(req).then(cachedRes => {
          if (cachedRes) return cachedRes;
          // fallback: se manca tutto, prova la home
          return caches.match("./index.html");
        });
      })
  );
});
