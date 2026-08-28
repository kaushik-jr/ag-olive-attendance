const CACHE_NAME = "ag-olive-v2";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "/dashboard.html",
    "/dashboard.js",
    "/attendance.html",
    "/attendance.js",
    "/members.html",
    "/members.js",
    "/weekly.html",
    "/weekly.js",
    "/reports.html",
    "/reports.js",
    "/manifest.json"
];

self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

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

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
