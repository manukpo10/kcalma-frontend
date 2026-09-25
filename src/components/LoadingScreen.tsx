import { BrandMark } from './ui/BrandMark'

export function LoadingScreen() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg">
      <BrandMark size="lg" className="animate-pulse" />
      <p className="text-sm font-medium text-ink-muted">Cargando Kcalma...</p>
    </div>
  )
}
