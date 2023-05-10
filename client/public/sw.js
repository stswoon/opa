const cacheName = 'Opa-v0.1';

const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './main.js',
    './style.css',
    './favicon.ico'
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// self.addEventListener('activate', event => {
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return Promise.all(
//                 cacheNames
//                     .filter(cacheName => {
//                         return urlsToCache.indexOf(cacheName) !== -1
//                     })
//                     .map(cacheName => {
//                         return caches.delete(cacheName);
//                     })
//             );
//         })
//     );
// });

self.addEventListener('activate', (event) => {
    let cacheKeepList = [cacheName];
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (cacheKeepList.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', event => {
    //network falling back to the cache
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request);
        })
    );
});
