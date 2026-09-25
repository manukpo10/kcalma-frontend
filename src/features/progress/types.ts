export type ProgressRangeKey = '1M' | '3M' | '1Y' | 'ALL'

/** One weigh-in's raw value + the smoothed trend at that date. */
export interface WeightPoint {
  date: string
  weightKg: number
  trendKg: number
}

/**
 * startKg/trendKg are the smoothed trend (not a single noisy weigh-in) at the start of the
 * range and at the latest weigh-in; currentKg is the latest *raw* weigh-in, shown for
 * reference. Any field is null when it can't be computed yet (see ProgressService on the API).
 */
export interface ProgressStats {
  startKg: number | null
  currentKg: number | null
  trendKg: number | null
  changeKg: number | null
  weeklyRateKg: number | null
  goalWeightKg: number | null
  projectedGoalDate: string | null
  progressPct: number | null
}

export interface NutritionDay {
  date: string
  kcal: number
  targetKcal: number
  proteinG: number
  targetProteinG: number
  logged: boolean
}

export interface ProgressNutrition {
  days: NutritionDay[]
  avgKcal: number | null
  avgProteinG: number | null
  adherencePct: number | null
  loggedStreakDays: number
}

export interface ProgressResponse {
  range: ProgressRangeKey
  from: string
  to: string
  weights: WeightPoint[]
  stats: ProgressStats
  nutrition: ProgressNutrition
}

export interface WeightEntryResponse {
  id: string
  entryDate: string
  weightKg: number
  createdAt: string
  updatedAt: string
}

export interface UpsertWeightResponse {
  entry: WeightEntryResponse
  targetsUpdated: boolean
}
