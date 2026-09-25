import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './ui/Button'

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

/**
 * Detects when a new deploy is waiting and lets the user opt into it.
 *
 * iOS resumes an installed PWA from the background instead of relaunching it, so the
 * browser rarely gets a natural chance to notice a new service worker. This component
 * drives that check itself — on visibility change, on focus, and on an interval — and
 * shows a toast instead of reloading silently: a silent reload could land while the
 * user is mid add-meal flow (e.g. right after returning from the native camera, which
 * is itself a hidden→visible transition) and wipe an unsaved photo analysis. The user
 * always decides when to update.
 *
 * Mounted once at the app root, outside the auth guards, so it also works on /login.
 */
export function UpdatePrompt() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | undefined>()
  const [updating, setUpdating] = useState(false)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, swRegistration) {
      setRegistration(swRegistration)
    },
  })

  useEffect(() => {
    if (!registration) return

    const checkForUpdate = () => {
      void registration.update()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', checkForUpdate)
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }, UPDATE_CHECK_INTERVAL_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', checkForUpdate)
      window.clearInterval(intervalId)
    }
  }, [registration])

  if (!needRefresh) return null

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await updateServiceWorker(true)
    } catch {
      setUpdating(false)
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-40 flex justify-center px-4 animate-toast-in"
    >
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-4 shadow-lg">
        <p className="mb-3 text-sm font-semibold text-ink">Hay una versión nueva</p>
        <Button variant="primary" size="md" loading={updating} onClick={() => void handleUpdate()}>
          Actualizar
        </Button>
        <Button
          variant="ghost"
          size="md"
          className="mt-2"
          disabled={updating}
          onClick={() => setNeedRefresh(false)}
        >
          Más tarde
        </Button>
      </div>
    </div>
  )
}
