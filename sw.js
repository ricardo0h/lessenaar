// Lessenaar offline: de app-schil en pdf.js blijven in de cache, zodat de app
// op de iPad ook zonder wifi start. Je bibliotheek zelf staat in IndexedDB.
const VERSION = '9158431a3c8f';
const SHELL = 'lessenaar-shell-' + VERSION;
const RUNTIME = 'lessenaar-runtime';
const FILES = ['./', './index.html', './demo-oefenboek.pdf', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    await shell.addAll(FILES);
    // pdf.js meteen ophalen: anders werkt de eerste offline start niet
    const rt = await caches.open(RUNTIME);
    await Promise.all(['pdf.min.js', 'pdf.worker.min.js'].map(f =>
      fetch(PDFJS + f, { mode: 'cors' }).then(r => r.ok && rt.put(PDFJS + f, r)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('lessenaar-shell-') && key !== SHELL) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // De pagina zelf: eerst netwerk (zodat updates binnenkomen), anders de cache.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(SHELL).then(c => c.put('./index.html', copy));
      return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // pdf.js en lettertypen: cache eerst, ze veranderen nooit (vaste versie).
  if (url.hostname === 'cdnjs.cloudflare.com' || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      const copy = r.clone(); caches.open(RUNTIME).then(c => c.put(req, copy));
      return r;
    })));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
