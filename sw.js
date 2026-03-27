const CACHE = 'maivi-v7';
const VAPID_PUBLIC = 'BH1rAxT94_2Q90pcIvt2IamfbZpLWoRhFax47Gp2897Mo3u-Y58j-Z3CVoxGYa8YsyHtnc5h1yLUyUvNhaM22w4';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie : réseau d'abord, cache en fallback UNIQUEMENT pour les assets statiques
// Les requêtes Supabase (API) passent toujours par le réseau
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase / API → toujours réseau, jamais cache
  if (url.hostname.includes('supabase') || url.hostname.includes('anthropic')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // index.html → réseau d'abord pour avoir toujours la dernière version
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets statiques (images, fonts) → cache d'abord
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

// Push notifications
self.addEventListener('push', e => {
  let data = { title: 'Maivi', body: 'Nouvelle notification', url: '/MAIVI/' };
  try { data = e.data?.json() || data; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/MAIVI/icon-192.png',
      badge: '/MAIVI/icon-192.png',
      tag: data.tag || 'maivi-notif',
      data: { url: data.url || '/MAIVI/' },
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/MAIVI/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('/MAIVI/') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    const { title, body, url, delayMs, tag } = e.data.payload;
    if (delayMs > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body, icon: '/MAIVI/icon-192.png', badge: '/MAIVI/icon-192.png',
          tag: tag || 'maivi-local', data: { url: url || '/MAIVI/' }
        });
      }, delayMs);
    }
  }
});
