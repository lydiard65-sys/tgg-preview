/* Truckin' Good Gear — service worker (preview site) */
var CACHE_NAME = 'tgg-static-v3';
var PRECACHE = [
  './',
  './index.html',
  './float-em.html',
  './check-your-truckin-mates.html',
  './shop.html',
  './assets/css/style.css',
  './assets/js/config.js',
  './assets/js/main.js',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './favicon.svg',
  './favicon-32.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512-maskable.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE_NAME;
      }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isHtmlRequest(request) {
  if (request.mode === 'navigate') return true;
  if (request.destination === 'document') return true;
  var url = new URL(request.url);
  return url.pathname.endsWith('.html') || url.pathname.endsWith('/');
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isHtmlRequest(request)) {
    // Network-first for HTML
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (!response || response.status !== 200) return response;
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, copy);
        });
        return response;
      });
    })
  );
});
