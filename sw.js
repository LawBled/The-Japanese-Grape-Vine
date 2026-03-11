const CACHE = 'jp-study-v1';
const ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700;900&family=Zen+Old+Mincho:wght@400;700;900&family=Inconsolata:wght@400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache local assets immediately; fonts best-effort
      return cache.addAll(['/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'])
        .then(() => cache.add('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700;900&family=Zen+Old+Mincho:wght@400;700;900&family=Inconsolata:wght@400;500;600&display=swap').catch(() => {}));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for Google Fonts (so updates come through)
  if (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
