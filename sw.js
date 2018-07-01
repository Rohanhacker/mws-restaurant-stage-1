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
                'img/1.jpg',
                'img/2.jpg',
                'img/3.jpg',
                'img/4.jpg',
                'img/5.jpg',
                'img/6.jpg',
                'img/7.jpg',
                'img/8.jpg',
                'img/9.jpg',
                'img/10.jpg',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
                'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
                'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
                'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
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
})