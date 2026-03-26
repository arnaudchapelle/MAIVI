const CACHE = 'maivi-v5';
const VAPID_PUBLIC = 'BH1rAxT94_2Q90pcIvt2IamfbZpLWoRhFax47Gp2897Mo3u-Y58j-Z3CVoxGYa8YsyHtnc5h1yLUyUvNhaM22w4';

// ── INSTALL / ACTIVATE ──────────────────────────────
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH — réseau d'abord, cache en fallback ───────
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// ── PUSH — reçoit les notifs du serveur ─────────────
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
      requireInteraction: false,
      silent: false,
    })
  );
});

// ── NOTIFICATION CLICK ──────────────────────────────
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

// ── MESSAGES depuis l'app ───────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    scheduleNotification(e.data.payload);
  }
});

// Notification locale programmée (via setTimeout — reste en mémoire du SW)
function scheduleNotification({ title, body, url, delayMs, tag }) {
  if (!delayMs || delayMs < 0) return;
  setTimeout(() => {
    self.registration.showNotification(title, {
      body, icon: '/MAIVI/icon-192.png', badge: '/MAIVI/icon-192.png',
      tag: tag || 'maivi-local', data: { url: url || '/MAIVI/' }
    });
  }, delayMs);
}
