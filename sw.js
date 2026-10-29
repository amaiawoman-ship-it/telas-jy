/* Telas JY: guarda la app en el aparato para abrirla sin internet. */
var CACHE = "telas-jy-v2";
var ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
/* Abre lo guardado al instante y busca una versión nueva en segundo plano. */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(function(hit){
    var red = fetch(e.request).then(function(r){
      if (r && r.ok){ var copia = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copia); }); }
      return r;
    }).catch(function(){ return hit; });
    return hit || red;
  }));
});
