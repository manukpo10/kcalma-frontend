const numberFormatter = new Intl.NumberFormat('es-AR')

/** Formats a plain number using Argentina conventions (e.g. 2385 -> "2.385"). */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}
