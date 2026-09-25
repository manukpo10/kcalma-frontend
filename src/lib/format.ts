const numberFormatter = new Intl.NumberFormat('es-AR')
const weightFormatter = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const signedWeightFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})
const percentFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/** Formats a plain number using Argentina conventions (e.g. 2385 -> "2.385"). */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** One decimal place, Argentina conventions (e.g. 78.4 -> "78,4"). */
export function formatWeight(value: number): string {
  return weightFormatter.format(value)
}

/** Same as {@link formatWeight} but always shows a leading sign (e.g. "+0,6" / "-1,4" / "0,0"). */
export function formatSignedWeight(value: number): string {
  return signedWeightFormatter.format(value)
}

/** Whole-number percent, Argentina conventions (e.g. 62.5 -> "63%"). */
export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`
}
