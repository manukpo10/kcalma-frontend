import type { FoodEntry, MealType, Totals } from '../food/types'
import type { NutritionTargetsResponse } from '../profile/types'

export interface DayWater {
  consumedMl: number
  targetMl: number
}

export interface DayResponse {
  date: string
  targets: NutritionTargetsResponse
  consumed: Totals
  remaining: Totals
  exceeded: {
    kcal: boolean
    sugar: boolean
    sodium: boolean
  }
  meals: Record<MealType, FoodEntry[]>
  water: DayWater
}
