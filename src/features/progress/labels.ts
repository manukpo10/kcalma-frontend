import { formatLongDate } from '../../lib/date'
import type { ProgressRangeKey, ProgressStats } from './types'

export const RANGE_OPTIONS: { value: ProgressRangeKey; label: string }[] = [
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1A' },
  { value: 'ALL', label: 'Todo' },
]

/** A weigh-in within this many kg of the goal reads as "already there" — mirrors the backend's GoalProjectionCalculator. */
const AT_GOAL_THRESHOLD_KG = 0.1

export interface GoalMessage {
  text: string
  /** true once at/past the goal — used to swap the progress bar and icon to a "done" look. */
  atGoal: boolean
}

/**
 * Picks the one sentence shown under the goal progress bar. Mirrors, on the client, the same
 * "moving toward vs. away from the goal" read the backend's GoalProjectionCalculator makes, so
 * the copy never contradicts what the projection date (or its absence) implies.
 */
export function goalMessage(stats: ProgressStats): GoalMessage | null {
  if (stats.goalWeightKg === null) {
    return null // caller shows the "set a goal" CTA instead
  }
  if (stats.trendKg === null) {
    return { text: 'Registrá tu peso para ver tu progreso hacia la meta.', atGoal: false }
  }

  const remaining = stats.goalWeightKg - stats.trendKg
  if (Math.abs(remaining) <= AT_GOAL_THRESHOLD_KG) {
    return { text: '¡Llegaste a tu peso objetivo!', atGoal: true }
  }
  if (stats.projectedGoalDate) {
    return { text: `Llegás a tu meta aprox. el ${formatLongDate(stats.projectedGoalDate)}.`, atGoal: false }
  }
  if (stats.weeklyRateKg === null) {
    return { text: 'Seguí registrando tu peso para proyectar una fecha.', atGoal: false }
  }
  if (Math.sign(stats.weeklyRateKg) !== Math.sign(remaining)) {
    return { text: 'Tu tendencia se está alejando de la meta.', atGoal: false }
  }
  return { text: 'Todavía no hay una proyección confiable — seguí registrando tu peso.', atGoal: false }
}
