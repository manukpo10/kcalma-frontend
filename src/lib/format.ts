const numberFormatter = new Intl.NumberFormat('es-AR')
const weightFormatter = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const signedWeightFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})
const percentFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
const litersFormatter = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Formats a plain number using Argentina conventions (e.g. 2385 -> "2.385"). */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** One decimal place, Argentina conventions (e.g. 78.4 -> "78,4"). */
export function formatWeight(value: number): string {
  return weightFormatter.format(value)
}

/** Ingredient-level macro grams: whole numbers from 10 g up, one decimal below (e.g. "0,4 g") —
 *  a dab of mayo or a drizzle of oil would otherwise round away to "0 g". Only for the compact
 *  per-ingredient `MacroChips` (`size="sm"`); the dish header keeps whole-gram formatting. */
export function formatMacroGrams(value: number): string {
  return Math.abs(value) >= 10 ? formatNumber(Math.round(value)) : formatWeight(value)
}

/** Same as {@link formatWeight} but always shows a leading sign (e.g. "+0,6" / "-1,4" / "0,0"). */
export function formatSignedWeight(value: number): string {
  return signedWeightFormatter.format(value)
}

/** Same formatting as {@link formatWeight} (one decimal, Argentina conventions) for any other
 *  single-decimal metric — body measurements, percentages — so the call site's name matches what
 *  it's actually formatting instead of borrowing a weight-flavored name. */
export function formatDecimal(value: number): string {
  return weightFormatter.format(value)
}

/** Same as {@link formatDecimal} but always shows a leading sign — mirrors {@link formatSignedWeight}. */
export function formatSignedDecimal(value: number): string {
  return signedWeightFormatter.format(value)
}

/** Two decimal places, Argentina conventions (e.g. 1.25 -> "1,25") — used for water tracking,
 *  where the 250 ml quick-add increment needs more precision than the one-decimal formatters above. */
export function formatLiters(value: number): string {
  return litersFormatter.format(value)
}

/** Whole-number percent, Argentina conventions (e.g. 62.5 -> "63%"). */
export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`
}
