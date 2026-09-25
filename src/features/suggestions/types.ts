import type { AnalyzedItem, MealType, Totals } from '../food/types'

/** One suggested meal — same item shape as a photo/text analysis result, plus totals the backend already computed. */
export interface SuggestionOption {
  title: string
  description: string
  prepMinutes: number
  why: string
  items: AnalyzedItem[]
  totals: Totals
}

/** Body for POST /api/suggestions — the backend recomputes the remaining budget itself from `date`. */
export interface SuggestionRequestBody {
  date: string
  mealType: MealType
  preferences?: string
}

export interface SuggestionResponse {
  remaining: Totals
  options: SuggestionOption[]
  note: string | null
}
