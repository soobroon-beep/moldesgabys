/* Moldes Gaby´s: servicio de instalación ligero.
   No cachea las fotos ni modifica el catálogo ni las compras. */
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  // El navegador recibe la navegación normalmente; sin respuestas antiguas.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
  }
});
