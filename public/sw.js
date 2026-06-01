const CACHE = 'honeymoon-v2'
const SHELL = ['/', '/reis', '/ontdek', '/dagboek', '/lijsten', '/budget', '/instellingen', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return // API nooit cachen

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

self.addEventListener('push', e => {
  const data = e.data?.json() || { title:'Abdul & Lilia 💍', body:'Nieuw bericht!' }
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png', vibrate: [100, 50, 100],
    tag: 'honeymoon',
  }))
})
