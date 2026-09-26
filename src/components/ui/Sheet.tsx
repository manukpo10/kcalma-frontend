import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SheetProps {
  onClose: () => void
  ariaLabel: string
  children: ReactNode
  className?: string
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Shared bottom-sheet/dialog primitive — every hand-rolled `role="dialog"` in the app
 * (EditEntryModal, DeleteMealModal, RegisterWeightSheet, EditWeightSheet) renders through this
 * instead of repeating the same chrome. Provides what none of them had on their own:
 * - A focus trap (Tab/Shift+Tab cycle within the panel).
 * - Escape closes it.
 * - Focus returns to whatever triggered it once it closes.
 * - Body scroll lock while open.
 * - Safe-area-aware padding and one consistent open animation (respects reduced motion via the
 *   global `prefers-reduced-motion` rule in index.css — no extra handling needed here).
 *
 * If a descendant already has focus when this mounts (e.g. an `autoFocus` input like
 * RegisterWeightSheet's), that's left alone; otherwise focus moves to the panel itself rather
 * than to its first control, so a destructive first button (DeleteMealModal's "Eliminar") is
 * never focused by default.
 */
export function Sheet({ onClose, ariaLabel, children, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Mount/unmount only — re-running this on every render (e.g. because `onClose` is a fresh
  // inline arrow function each time) would re-steal focus from whatever the user just tabbed
  // into inside the sheet. Latest `onClose` is read through the ref above instead.
  useEffect(() => {
    const panel = panelRef.current
    triggerRef.current = document.activeElement as HTMLElement | null

    if (panel && !panel.contains(document.activeElement)) {
      panel.focus()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [])

  return (
    <div
      className="animate-fade-in fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'animate-sheet-in w-full max-w-md rounded-t-2xl bg-surface p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-lg outline-none sm:rounded-2xl',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
