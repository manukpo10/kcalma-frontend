/** Local-time (not UTC) date-string helpers — the API and the UI both speak plain YYYY-MM-DD. */

function toIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Today's date in the browser's local timezone — never `toISOString()`, which is UTC and can be off by a day. */
export function todayIso(): string {
  return toIso(new Date())
}

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parses a `?date=YYYY-MM-DD` search param (used to backfill meals on days before today). Falls
 * back to today for anything missing, malformed, calendar-invalid (e.g. `2024-02-31`, which `Date`
 * would silently roll into March), or in the future — callers never have to re-validate this
 * themselves before using it as an `entryDate`.
 */
export function parseDateParam(value: string | null | undefined): string {
  if (!value || !DATE_PARAM_PATTERN.test(value)) return todayIso()
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const isRealCalendarDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  if (!isRealCalendarDate) return todayIso()
  // Plain ISO strings compare lexicographically the same as chronologically, so no Date math needed.
  return value > todayIso() ? todayIso() : value
}

export function addDays(iso: string, delta: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + delta)
  return toIso(date)
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

/** "Hoy" / "Ayer" for the last two days, otherwise a short Spanish weekday + date. */
export function formatDayLabel(iso: string): string {
  if (iso === todayIso()) return 'Hoy'
  if (iso === addDays(todayIso(), -1)) return 'Ayer'
  const [year, month, day] = iso.split('-').map(Number)
  return WEEKDAY_FORMATTER.format(new Date(year, month - 1, day))
}

function toLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

/** "25 sep" — compact axis/list label. */
export function formatShortDate(iso: string): string {
  return SHORT_DATE_FORMATTER.format(toLocalDate(iso))
}

/** "25 de septiembre de 2026" — full date for messages like the goal projection sentence. */
export function formatLongDate(iso: string): string {
  return LONG_DATE_FORMATTER.format(toLocalDate(iso))
}
