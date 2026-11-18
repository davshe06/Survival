/* Service worker: caches the whole app for offline use, and caches map tiles as they are viewed/downloaded. */
const VERSION = '2026.11.18-6';
const APP_CACHE = 'fg-app-' + VERSION;
const TILE_CACHE = 'fg-tiles-v1';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css',
  'js/app.js', 'js/geo.js', 'js/tools.js', 'js/map.js',
  'data/content-core.js', 'data/content-medical.js', 'data/content-dogs.js', 'data/content-food.js', 'data/content-skills.js', 'data/content-fix.js', 'data/gear.js', 'data/map-se.js', 'data/water.json', 'data/se/index.json',
  ...['AL','AR','FL','GA','KY','LA','MS','NC','SC','TN','VA','WV'].map(c => 'data/se/' + c + '.json'),
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

async function cacheAll() {
  const c = await caches.open(APP_CACHE);
  await Promise.all(ASSETS.map(u => fetch(u, { cache: 'reload' }).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})));
  const clients = await self.clients.matchAll();
  clients.forEach(cl => cl.postMessage({ type: 'cached', total: ASSETS.length }));
}

self.addEventListener('install', e => { e.waitUntil(cacheAll().then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('fg-app-') && k !== APP_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'recache') e.waitUntil(cacheAll()); });

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Map tiles: cache-first, then network (and store what we viewed, capped)
  if (/basemap\.nationalmap\.gov|tile\.openstreetmap\.org|elevation-tiles-prod/.test(url.href)) {
    e.respondWith((async () => {
      const c = await caches.open(TILE_CACHE);
      const hit = await c.match(req.url);
      if (hit) return hit;
      try {
        const r = await fetch(req);
        if (r.ok || r.type === 'opaque') { c.put(req.url, r.clone()); trimTiles(c); }
        return r;
      } catch (err) { return new Response('', { status: 504 }); }
    })());
    return;
  }
  if (url.origin !== location.origin) return;
  // App files: cache-first (works offline), refresh in background when online
  e.respondWith((async () => {
    const c = await caches.open(APP_CACHE);
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('index.html') : null);
    const net = fetch(req).then(r => { if (r.ok && ASSETS.some(a => url.pathname.endsWith(a.replace('./', '/')) )) c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net; return r || new Response('Offline', { status: 503 });
  })());
});

let trimming = false;
async function trimTiles(c) {
  if (trimming) return; trimming = true;
  try { const keys = await c.keys(); if (keys.length > 30000) for (const k of keys.slice(0, keys.length - 30000)) await c.delete(k); } finally { trimming = false; }
}
