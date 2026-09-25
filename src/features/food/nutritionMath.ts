import type { Per100, Totals } from './types'

/**
 * totals = per100 * grams / 100, rounded to the nearest whole unit — mirrors the backend's
 * NutritionMath exactly (com.kcalma.food.NutritionMath) so live preview numbers while editing
 * grams match what gets saved.
 */
export function computeTotals(per100: Per100, grams: number): Totals {
  const factor = grams / 100
  return {
    kcal: Math.round(per100.kcalPer100 * factor),
    protein: Math.round(per100.proteinPer100 * factor),
    fat: Math.round(per100.fatPer100 * factor),
    carbs: Math.round(per100.carbsPer100 * factor),
    fiber: Math.round(per100.fiberPer100 * factor),
    sugar: Math.round(per100.sugarPer100 * factor),
    sodiumMg: Math.round(per100.sodiumMgPer100 * factor),
  }
}

export const ZERO_TOTALS: Totals = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodiumMg: 0 }

export function sumTotals(items: Totals[]): Totals {
  return items.reduce(
    (sum, t) => ({
      kcal: sum.kcal + t.kcal,
      protein: sum.protein + t.protein,
      fat: sum.fat + t.fat,
      carbs: sum.carbs + t.carbs,
      fiber: sum.fiber + t.fiber,
      sugar: sum.sugar + t.sugar,
      sodiumMg: sum.sodiumMg + t.sodiumMg,
    }),
    ZERO_TOTALS,
  )
}
