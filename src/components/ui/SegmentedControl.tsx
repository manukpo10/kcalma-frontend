import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  'aria-label': string
  className?: string
}

/** iOS-style segmented picker for small mutually-exclusive option sets (2-3 items). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={props['aria-label']}
      className={cn('flex gap-1 rounded-lg bg-surface-2 p-1', className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-semibold',
              'transition-all duration-150 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
              selected ? 'bg-surface text-primary-300 shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            {option.icon && (
              <span aria-hidden="true" className="shrink-0">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
