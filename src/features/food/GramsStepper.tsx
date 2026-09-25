import { Minus, Plus } from 'lucide-react'

interface GramsStepperProps {
  value: number
  onChange: (value: number) => void
  step?: number
}

const MIN_GRAMS = 1
const MAX_GRAMS = 5000

/** Nudge buttons + a direct-entry field, clamped to a sane portion-size range. */
export function GramsStepper({ value, onChange, step = 10 }: GramsStepperProps) {
  const clamp = (n: number) => Math.min(MAX_GRAMS, Math.max(MIN_GRAMS, n))

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        aria-label="Restar gramos"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-hairline active:bg-hairline"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value)
          if (!Number.isNaN(parsed)) onChange(clamp(parsed))
        }}
        aria-label="Gramos"
        className="h-9 w-16 rounded-lg border border-hairline bg-surface text-center text-sm font-semibold text-ink"
      />
      <span className="text-sm text-ink-muted">g</span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        aria-label="Sumar gramos"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-hairline active:bg-hairline"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
