import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

// TS 5.9's DOM lib no longer declares ServiceWorkerGlobalScope as a global
// (it lives in lib.webworker), so type `self` pragmatically for this
// self-contained service worker script.
declare const self: any

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// ---- Background sync for queued offline submissions (comments & newsletter) ----
self.addEventListener('sync', (event) => {
  if (event.tag === 'queue-submissions') {
    event.waitUntil(flushQueue())
  }
})

async function flushQueue() {
  try {
    const cache = await caches.open('offline-queue')
    const keys = await cache.keys()
    for (const key of keys) {
      const entry = await cache.match(key)
      const payload = await entry?.json()
      if (payload?.url) {
        await fetch(payload.url, {
          method: payload.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload.body || {}),
        })
        await cache.delete(key)
      }
    }
  } catch (error) {
    console.error('Background sync flush failed', error)
  }
}

// ---- Push notifications ----
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Apple Magic Blog'
  const options: NotificationOptions = {
    body: data.body || 'New from Apple Magic Blog',
    icon: '/icons/apple-magic-192.png',
    badge: '/icons/apple-magic-192.png',
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      }),
  )
})
