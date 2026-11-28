// Lessenaar offline: de app-schil en pdf.js blijven in de cache, zodat de app
// op de iPad ook zonder wifi start. Je bibliotheek zelf staat in IndexedDB.
// pdf.js staat in vendor/ (ADR-3): eigen host, geen CDN meer.
const VERSION = 'd06e941031ac';
const SHELL = 'lessenaar-shell-' + VERSION;
const RUNTIME = 'lessenaar-runtime';
const FILES = ['./', './index.html', './demo-oefenboek.pdf', './manifest.webmanifest', './icon-180.png', './icon-512.png',
  './vendor/pdfjs-3.11.174/pdf.min.js', './vendor/pdfjs-3.11.174/pdf.worker.min.js'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    await shell.addAll(FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('lessenaar-shell-') && key !== SHELL) await caches.delete(key);
    // pdf.js van cdnjs (tot R3) uit de runtime-cache halen
    const rt = await caches.open(RUNTIME);
    for (const req of await rt.keys()) if (new URL(req.url).hostname === 'cdnjs.cloudflare.com') await rt.delete(req);
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
  // Lettertypen (tot R4): cache eerst, ze veranderen nooit (vaste versie).
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
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
