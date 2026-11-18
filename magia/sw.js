// Service worker de La Magia Molona: hace que Chrome la reconozca como app propia
// (con su icono del conejito), separada de la Cesta. No guarda nada en caché.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>new Response('<h1 style="font-family:sans-serif">Sin conexión</h1><p style="font-family:sans-serif">Abre La Magia Molona cuando tengas internet.</p>',{headers:{'Content-Type':'text/html; charset=utf-8'}})))}});
