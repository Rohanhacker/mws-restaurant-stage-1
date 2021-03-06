importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js');

if (workbox) {
console.log(`Yay! Workbox is loaded 🎉`);
const queue = new workbox.backgroundSync.Queue('review-queue');

preCache();

self.addEventListener('fetch', (event) => {
    // Clone the request to ensure it's save to read when
    // adding to the Queue.
    if (event.request.url.match(/\/reviews/) && event.request.method === 'POST') {
    const promiseChain = fetch(event.request.clone())
    .catch((err) => {
        return queue.addRequest(event.request);
    });
    event.waitUntil(promiseChain);
    } else {
        let req = event.request;
        if (req.url.match(/restaurant.html/)) {
            req = new Request(
                req.url.split("?")[0]
            );
        }
        event.respondWith(
            caches.match(req).then(function(res) {
                if(res) return res;
                return fetch(req);
            })
        );
    }
});


} else {
console.log(`Boo! Workbox didn't load 😬 fallback`);
preCache();
self.addEventListener('fetch', (event) => {
    const clone = event.request.clone();
    let req = clone;
    if (req.url.match(/restaurant.html/)) {
        req = new Request(
            req.url.split("?")[0]
        );
    }
    event.respondWith(
        caches.match(req).then(function(res) {
            if(res) return res;
            return fetch(req);
        })
    );
})
}
function preCache() {
    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open('cache-v1').then(function(cache) {
                return cache.addAll([
                    '/',
                    'index.html',
                    'restaurant.html',
                    'css/styles.css',
                    'js/dbhelper.js',
                    'js/main.js',
                    'js/restaurant_info.js',
                    'data/restaurants.json',
                    'dist/1.jpg',
                    'dist/2.jpg',
                    'dist/3.jpg',
                    'dist/4.jpg',
                    'dist/5.jpg',
                    'dist/6.jpg',
                    'dist/7.jpg',
                    'dist/8.jpg',
                    'dist/9.jpg',
                    'dist/10.jpg',
                    'dist/1@2x.jpg',
                    'dist/2@2x.jpg',
                    'dist/3@2x.jpg',
                    'dist/4@2x.jpg',
                    'dist/5@2x.jpg',
                    'dist/6@2x.jpg',
                    'dist/7@2x.jpg',
                    'dist/8@2x.jpg',
                    'dist/9@2x.jpg',
                    'dist/10@2x.jpg',
                    'dist/1@3x.jpg',
                    'dist/2@3x.jpg',
                    'dist/3@3x.jpg',
                    'dist/4@3x.jpg',
                    'dist/5@3x.jpg',
                    'dist/6@3x.jpg',
                    'dist/7@3x.jpg',
                    'dist/8@3x.jpg',
                    'dist/9@3x.jpg',
                    'dist/10@3x.jpg',
                    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
                    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
                    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
                    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
                    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
                ]);
            })
        );
    });
}

