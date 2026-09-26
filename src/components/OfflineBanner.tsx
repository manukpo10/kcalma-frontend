import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Thin connectivity banner driven purely by the browser's own signal (`navigator.onLine` plus
 * the `online`/`offline` window events) — no polling, no network probe. Mounted once at the
 * app root so it shows on every screen, including `/login`.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div role="status" aria-live="polite" className="animate-fade-in fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-center gap-1.5 bg-danger pt-[max(env(safe-area-inset-top),0.375rem)] pb-1.5 text-xs font-semibold text-white">
        <WifiOff className="size-3.5 shrink-0" aria-hidden="true" />
        Sin conexión
      </div>
    </div>
  )
}
