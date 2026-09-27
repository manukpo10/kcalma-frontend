import { useEffect } from 'react'
import { useNavigate } from 'react-router'

/** Mirrors the same relative-path check in the service worker (src/sw.ts) — this only ever
 *  calls `navigate()` with a path the app itself understands, never an absolute URL. */
function isRelativePath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
}

/**
 * Bridges the service worker's `notificationclick` handler (src/sw.ts) back into the SPA. The SW
 * can't call `useNavigate()` itself, so on a notification tap it focuses this tab and
 * `postMessage`s `{ type: 'NAVIGATE', url }` to it instead — this listens for that message and
 * performs the actual in-app navigation, with no full page reload.
 *
 * Mounted once in App.tsx, outside the `<Routes>` tree, so it's active for every route —
 * including `/agregar`, which renders outside the AppShell route group.
 */
export function ServiceWorkerNavigationListener() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: unknown } | undefined
      if (data?.type === 'NAVIGATE' && isRelativePath(data.url)) {
        navigate(data.url)
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage)
  }, [navigate])

  return null
}
