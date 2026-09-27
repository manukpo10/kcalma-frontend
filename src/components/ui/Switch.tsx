import { cn } from '../../lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

/**
 * Settings-row toggle: label + optional description + track, the whole row is one `role="switch"`
 * button (not a track-only control with a separately-clickable label) so the tap target is the
 * full row height instead of a ~28px pill, and so there's only one interactive element per row
 * for assistive tech instead of two nested ones.
 */
export function Switch({ checked, onChange, label, description, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg py-2.5 text-left',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="block text-sm text-ink-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-150 ease-out',
          checked ? 'bg-primary' : 'bg-surface-2',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 translate-x-1 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out',
            checked && 'translate-x-6',
          )}
        />
      </span>
    </button>
  )
}
