/// <reference lib="webworker" />
// Custom service worker (vite-plugin-pwa injectManifest)
// (a) offline app-shell cache  (b) Web Push ontvangen & tonen
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] }

// Precache de app-shell (door build geïnjecteerd)
precacheAndRoute(self.__WB_MANIFEST || [])

self.addEventListener('install', () => { self.skipWaiting() })
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()) })

// Runtime cache voor GET (network-first, fallback cache)
self.addEventListener('fetch', (event: FetchEvent) => {
  const req = event.request
  if (req.method !== 'GET') return
  if (req.url.includes('/.netlify/functions/')) return // API nooit cachen
  event.respondWith(
    fetch(req).then(res => {
      const clone = res.clone()
      caches.open('hq-runtime').then(c => c.put(req, clone)).catch(() => {})
      return res
    }).catch(() => caches.match(req).then(r => r || new Response('', { status: 504 })))
  )
})

// Push ontvangen → notificatie tonen (ook met app dicht, op iOS 16.4+ PWA)
self.addEventListener('push', (event: PushEvent) => {
  let data: any = { title: 'Honeymoon HQ', body: '✦' }
  try { data = event.data?.json() || data } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' },
      vibrate: [80, 40, 80],
    } as NotificationOptions)
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data as any)?.url || '/'
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then((cl: readonly WindowClient[]) => {
    for (const c of cl) if ('focus' in c) return c.focus()
    return self.clients.openWindow(url)
  }))
})
