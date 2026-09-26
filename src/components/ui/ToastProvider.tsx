import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

interface ToastOptions {
  message: string
  /** Label for the action button, e.g. "Deshacer". Omit for a plain message-only toast. */
  actionLabel?: string
  onAction?: () => void | Promise<void>
  durationMs?: number
}

interface ActiveToast extends ToastOptions {
  id: number
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const DEFAULT_DURATION_MS = 6000

let nextToastId = 0

/**
 * App-wide toast/snackbar: one active toast at a time (a new one replaces whatever is showing),
 * auto-dismissed after ~6s, with an optional action button (e.g. "Deshacer" after a delete).
 * Mounted once at the app root so `useToast()` works from anywhere, including a modal that
 * unmounts itself right after triggering the toast (e.g. EditEntryModal closing after delete).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)

  const dismiss = useCallback(() => {
    window.clearTimeout(timeoutRef.current)
    setToast(null)
  }, [])

  const showToast = useCallback((options: ToastOptions) => {
    window.clearTimeout(timeoutRef.current)
    const id = ++nextToastId
    setToast({ id, ...options })
    timeoutRef.current = window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, options.durationMs ?? DEFAULT_DURATION_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const handleAction = async () => {
    if (!toast?.onAction) return
    const { onAction } = toast
    dismiss()
    try {
      await onAction()
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'No se pudo deshacer.' })
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-toast-in fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-40 flex justify-center px-4"
        >
          <div className="flex w-full max-w-sm items-center gap-1 rounded-2xl border border-hairline bg-surface py-1.5 pl-4 pr-2 shadow-lg">
            <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => void handleAction()}
                className="flex h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-primary-400 transition-colors hover:text-primary-300 active:text-primary-300"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
