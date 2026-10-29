/* Telas JY: guarda la app en el aparato para abrirla sin internet. */
var CACHE = "telas-jy-v3";
var ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

/* Al instalar, baja los archivos saltándose el caché del navegador, para guardar siempre la versión más nueva. */
self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(ARCHIVOS.map(function(u){
        return fetch(new Request(u, {cache: "reload"})).then(function(r){
          if (!r.ok) throw new Error("No se pudo bajar " + u);
          return c.put(u, r);
        });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
/* Abre lo guardado al instante y revisa en segundo plano si hay una versión nueva (preguntando al servidor, sin usar copias viejas). */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(function(hit){
    var red = fetch(url.href, {cache: "no-cache"}).then(function(r){
      if (r && r.ok){
        var copia = r.clone();
        caches.open(CACHE).then(function(c){ return c.put(e.request, copia); });
      }
      return r;
    }).catch(function(){ return hit; });
    return hit || red;
  }));
});
