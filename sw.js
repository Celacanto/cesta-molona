/* Service worker de La Cesta Molona
   - Guarda la app (HTML, manifest e iconos) para que abra sin conexión.
   - Páginas: primero la red (para recibir siempre la última versión) y, si no hay conexión, la copia guardada.
   - Resto de archivos (iconos, fuentes): primero la copia guardada y se actualiza en segundo plano.
   Cambia VERSION cada vez que publiques una versión nueva de index.html. */
const VERSION = 'cesta-molona-v64';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).pathname.endsWith('/version.txt')) return; // siempre de la red

  // Páginas (navegación): red primero, copia guardada si no hay conexión
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req.url, { cache: 'no-cache' }) // pregunta siempre si hay versión nueva, sin fiarse de la caché del navegador
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Resto (iconos, manifest, fuentes de Google): copia guardada primero, actualizada en segundo plano
  event.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
