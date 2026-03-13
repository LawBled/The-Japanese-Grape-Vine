const CACHE = 'grapevine-v1';
const ASSETS = ['/index.html'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch', e=>{
  const url = e.request.url;
  if(url.includes('fonts.googleapis.com')||url.includes('fonts.gstatic.com')){
    e.respondWith(
      caches.open(CACHE).then(c=>
        c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res;}))
      )
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
