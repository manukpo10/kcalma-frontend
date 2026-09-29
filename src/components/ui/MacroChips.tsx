import { cn } from '../../lib/cn'
import { formatMacroGrams, formatNumber } from '../../lib/format'

type MacroChipsSize = 'md' | 'sm'

interface MacroChipsProps {
  /** When present, a kcal chip is rendered first. */
  kcal?: number
  protein: number
  fat: number
  carbs: number
  /** 'md' (default) is the dish-header look: whole grams, as always. 'sm' is the compact variant
   *  for per-ingredient rows — smaller chips, and macro grams show one decimal below 10 g instead
   *  of rounding small amounts away to 0 (see `formatMacroGrams`). Pass raw (unrounded) grams when
   *  using 'sm' so that threshold applies to the true value, not an already-rounded one. */
  size?: MacroChipsSize
  className?: string
}

// Same names, order and colors as the "Hoy" dashboard tiles, so every screen reads the same way.
const MACROS = [
  { key: 'protein', label: 'Proteína', color: 'var(--color-protein)', tint: 'var(--color-protein-tint)' },
  { key: 'fat', label: 'Grasas', color: 'var(--color-fat)', tint: 'var(--color-fat-tint)' },
  { key: 'carbs', label: 'Carbos', color: 'var(--color-carbs)', tint: 'var(--color-carbs-tint)' },
] as const

const CHIP_SIZE_CLASSES: Record<MacroChipsSize, string> = {
  md: 'rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
  sm: 'rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
}

/** Nutrition of one food or meal as labelled, color-coded chips (no single-letter abbreviations). */
export function MacroChips({ kcal, protein, fat, carbs, size = 'md', className }: MacroChipsProps) {
  const grams = { protein, fat, carbs }
  const chipClass = CHIP_SIZE_CLASSES[size]
  const formatGrams = size === 'sm' ? formatMacroGrams : formatNumber
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {kcal !== undefined && (
        <span
          className={chipClass}
          style={{ backgroundColor: 'var(--color-primary-tint)', color: 'var(--color-primary-300)' }}
        >
          {formatNumber(kcal)} kcal
        </span>
      )}
      {MACROS.map((macro) => (
        <span key={macro.key} className={chipClass} style={{ backgroundColor: macro.tint, color: macro.color }}>
          {macro.label} {formatGrams(grams[macro.key])} g
        </span>
      ))}
    </div>
  )
}
