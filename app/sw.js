// Service worker: aplikacja działa offline. Przy każdej zmianie plików podbij numer wersji.
var VERSION = 'fakturka-v7';
var FILES = ['./', 'index.html', 'styles.css', 'app.js', 'templates.js', 'i18n.js', 'i18n-more.js', 'i18n-auth.js', 'templates-i18n.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Najpierw sieć (świeża wersja), a bez internetu – kopia z pamięci.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
