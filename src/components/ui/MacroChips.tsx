import { cn } from '../../lib/cn'
import { formatNumber } from '../../lib/format'

interface MacroChipsProps {
  /** When present, a kcal chip is rendered first. */
  kcal?: number
  protein: number
  fat: number
  carbs: number
  className?: string
}

// Same names, order and colors as the "Hoy" dashboard tiles, so every screen reads the same way.
const MACROS = [
  { key: 'protein', label: 'Proteína', color: 'var(--color-protein)', tint: 'var(--color-protein-tint)' },
  { key: 'fat', label: 'Grasas', color: 'var(--color-fat)', tint: 'var(--color-fat-tint)' },
  { key: 'carbs', label: 'Carbos', color: 'var(--color-carbs)', tint: 'var(--color-carbs-tint)' },
] as const

const CHIP_CLASS = 'rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap'

/** Nutrition of one food or meal as labelled, color-coded chips (no single-letter abbreviations). */
export function MacroChips({ kcal, protein, fat, carbs, className }: MacroChipsProps) {
  const grams = { protein, fat, carbs }
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {kcal !== undefined && (
        <span
          className={CHIP_CLASS}
          style={{ backgroundColor: 'var(--color-primary-tint)', color: 'var(--color-primary-300)' }}
        >
          {formatNumber(kcal)} kcal
        </span>
      )}
      {MACROS.map((macro) => (
        <span key={macro.key} className={CHIP_CLASS} style={{ backgroundColor: macro.tint, color: macro.color }}>
          {macro.label} {formatNumber(grams[macro.key])} g
        </span>
      ))}
    </div>
  )
}
