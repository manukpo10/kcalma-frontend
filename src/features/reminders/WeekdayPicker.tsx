import { cn } from '../../lib/cn'
import { WEEKDAY_FULL_LABELS, WEEKDAY_LABELS, WEEKDAY_ORDER } from './labels'
import type { WeekdayCode } from './types'

interface WeekdayPickerProps {
  value: WeekdayCode[]
  onChange: (value: WeekdayCode[]) => void
  disabled?: boolean
  className?: string
}

/** Multi-select day-of-week row for the weigh-in reminder — MealTypePicker's pills but toggled
 *  independently (aria-pressed, not a radiogroup) since any number of days can be selected. */
export function WeekdayPicker({ value, onChange, disabled, className }: WeekdayPickerProps) {
  const toggle = (day: WeekdayCode) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day])
  }

  return (
    <div role="group" aria-label="Días de pesaje" className={cn('flex gap-1.5', className)}>
      {WEEKDAY_ORDER.map((day) => {
        const selected = value.includes(day)
        return (
          <button
            key={day}
            type="button"
            aria-pressed={selected}
            aria-label={WEEKDAY_FULL_LABELS[day]}
            disabled={disabled}
            onClick={() => toggle(day)}
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              'transition-colors duration-150 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              selected ? 'bg-primary text-primary-fg' : 'bg-surface-2 text-ink-muted hover:text-ink',
            )}
          >
            {WEEKDAY_LABELS[day]}
          </button>
        )
      })}
    </div>
  )
}
