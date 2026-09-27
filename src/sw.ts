/// <reference lib="webworker" />
// This file replaces vite-plugin-pwa's generated service worker (see `strategies:
// 'injectManifest'` in vite.config.ts) purely to add the push / notificationclick handlers below
// — `generateSW`'s declarative config has no hook for those. Everything else here reproduces the
// previous generated behavior exactly: precache the build's own assets, fall back to the cached
// app shell for SPA navigations, and never touch /api or Supabase (cross-origin, always network).
//
// `self` is `Window & typeof globalThis` under the app's own tsconfig (`lib: ["ES2023", "DOM"]`).
// The reference above pulls in the ServiceWorkerGlobalScope types (skipLibCheck keeps that from
// clashing with the DOM lib's own globals); this redeclaration only shadows `self` inside this
// module — the imports below already make the file a module instead of a global script.
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope

// Injected at build time by workbox-build with every precached build asset (see
// `injectManifest.globPatterns` in vite.config.ts) — this placeholder must appear literally for
// the plugin to find and replace it.
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Same SPA fallback the generated SW had: any navigation not otherwise precached (e.g. a deep
// link opened straight from a push notification while offline) resolves to the cached app shell.
// The denylist is a defensive no-op today — /api always goes to a different origin
// (VITE_API_URL), and NavigationRoute only ever matches `mode: 'navigate'` requests, never a
// same-origin fetch() — but it keeps that guarantee explicit if a same-origin /api proxy is ever added.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist: [/^\/api\//] }))

// The update prompt (src/components/UpdatePrompt.tsx, via useRegisterSW) calls
// `updateServiceWorker(true)`, which sends exactly this message to the waiting worker
// (workbox-window's `messageSkipWaiting()`) and reloads once it takes control. Without this
// listener the new SW would sit "waiting" forever and the prompt's "Actualizar" button would do
// nothing.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

interface PushPayload {
  title?: string
  body?: string
  url?: string
}

self.addEventListener('push', (event) => {
  const payload: PushPayload = event.data?.json() ?? {}
  const { title = 'Kcalma', body = '', url = '/' } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      data: { url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? '/'

  event.waitUntil(
    (async () => {
      const target = new URL(url, self.location.origin).href
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

      const existing = clients.find((client) => client.url === target) ?? clients[0]
      if (existing) {
        await existing.focus()
        if ('navigate' in existing) await existing.navigate(target)
        return
      }

      await self.clients.openWindow(target)
    })(),
  )
})
