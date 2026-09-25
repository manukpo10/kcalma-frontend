import { CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SelectableCardProps {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  icon?: ReactNode
  name?: string
}

/** Radio-style card with a title + one-line description, used for activity level etc. */
export function SelectableCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  name,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      name={name}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        selected
          ? 'border-primary-500 bg-primary-tint'
          : 'border-hairline bg-surface hover:border-neutral-700',
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full',
            selected ? 'bg-primary-tint text-primary-300' : 'bg-surface-2 text-ink-muted',
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={cn('block font-semibold', selected ? 'text-primary-300' : 'text-ink')}>
          {title}
        </span>
        {description && <span className="block text-sm text-ink-muted">{description}</span>}
      </span>
      <CircleCheck
        aria-hidden="true"
        className={cn(
          'size-5 shrink-0 transition-opacity duration-150',
          selected ? 'text-primary-600 opacity-100' : 'opacity-0',
        )}
      />
    </button>
  )
}
