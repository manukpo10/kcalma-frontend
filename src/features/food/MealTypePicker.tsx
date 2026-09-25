import { cn } from '../../lib/cn'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from './labels'
import type { MealType } from './types'

interface MealTypePickerProps {
  value: MealType
  onChange: (value: MealType) => void
  className?: string
}

/** Pill row for the 5 meal types — SegmentedControl is too cramped for that many options. */
export function MealTypePicker({ value, onChange, className }: MealTypePickerProps) {
  return (
    <div role="radiogroup" aria-label="Tipo de comida" className={cn('flex flex-wrap gap-2', className)}>
      {MEAL_TYPE_ORDER.map((mealType) => {
        const selected = mealType === value
        return (
          <button
            key={mealType}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(mealType)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
              selected ? 'bg-primary text-primary-fg' : 'bg-surface-2 text-ink-muted hover:text-ink',
            )}
          >
            {MEAL_TYPE_LABELS[mealType]}
          </button>
        )
      })}
    </div>
  )
}
