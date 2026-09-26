import type { AnalyzedDish, MealType, Totals } from '../food/types'

/** One suggested meal — same dish/ingredient shape as a photo/text analysis result, plus totals the backend already computed. */
export interface SuggestionOption {
  title: string
  description: string
  prepMinutes: number
  why: string
  dishes: AnalyzedDish[]
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
