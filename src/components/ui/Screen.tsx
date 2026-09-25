import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ScreenProps {
  children: ReactNode
  title?: string
  /** Small brand mark or icon rendered before the title, e.g. <BrandMark size="sm" />. */
  icon?: ReactNode
  onBack?: () => void
  actions?: ReactNode
  className?: string
  contentClassName?: string
}

/**
 * App shell: safe-area aware header + scrollable content, capped to a
 * comfortable phone-width column. Reused by every screen.
 */
export function Screen({ children, title, icon, onBack, actions, className, contentClassName }: ScreenProps) {
  const hasHeader = Boolean(title || icon || onBack || actions)

  return (
    <div className={cn('min-h-dvh bg-bg', className)}>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        {hasHeader && (
          <header className="sticky top-0 z-10 flex items-center gap-2 bg-bg/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur-sm">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Atrás"
                className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
            )}
            {icon}
            {title && <h1 className="flex-1 truncate text-lg font-bold text-ink">{title}</h1>}
            {actions && <div className="flex items-center gap-1">{actions}</div>}
          </header>
        )}
        <main
          className={cn(
            'flex-1 px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]',
            !hasHeader && 'pt-[max(env(safe-area-inset-top),1rem)]',
            contentClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
