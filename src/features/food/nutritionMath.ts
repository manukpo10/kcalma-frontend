import type {
  AnalyzedDish,
  CreateFavoriteRequest,
  DraftDish,
  FavoriteDish,
  FoodEntry,
  FoodEntryRequest,
  FoodSource,
  Per100,
  Totals,
} from './types'

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

/**
 * A dish's totals = the sum of its own ingredients' totals (each ingredient's per100 * grams /
 * 100) — mirrors the backend's `ResolvedDish#aggregate` exactly. Never the dish's own per100
 * directly: that field is itself derived FROM this sum (see `per100FromTotals`).
 */
export function computeDishTotals(ingredients: (Per100 & { grams: number })[]): Totals {
  return sumTotals(ingredients.map((ingredient) => computeTotals(ingredient, ingredient.grams)))
}

/**
 * The inverse of `computeTotals`: derives per-100g values from a known total and portion size —
 * mirrors the backend's NutritionMath.per100FromTotals exactly. Used to compute a dish's own
 * per-100g values (needed by the POST /api/food/entries payload) from its ingredients' totals.
 * `grams <= 0` returns all-zero per100 rather than dividing by zero.
 */
export function per100FromTotals(totals: Totals, grams: number): Per100 {
  if (grams <= 0) {
    return {
      kcalPer100: 0,
      proteinPer100: 0,
      fatPer100: 0,
      carbsPer100: 0,
      fiberPer100: 0,
      sugarPer100: 0,
      sodiumMgPer100: 0,
    }
  }
  const factor = 100 / grams
  return {
    kcalPer100: totals.kcal * factor,
    proteinPer100: totals.protein * factor,
    fatPer100: totals.fat * factor,
    carbsPer100: totals.carbs * factor,
    fiberPer100: totals.fiber * factor,
    sugarPer100: totals.sugar * factor,
    sodiumMgPer100: totals.sodiumMg * factor,
  }
}

/**
 * Dish-level source rule — mirrors the backend's `FoodSource#combine` exactly: every ingredient
 * shares one source -> that source; USDA + PERSONAL only -> USDA; anything else (an ESTIMATED
 * ingredient mixed with a matched one, or MANUAL mixed with anything) -> MIXED.
 */
export function combineSources(sources: FoodSource[]): FoodSource {
  const distinct = Array.from(new Set(sources))
  if (distinct.length === 1) return distinct[0]
  if (distinct.length === 2 && distinct.includes('USDA') && distinct.includes('PERSONAL')) return 'USDA'
  return 'MIXED'
}

/** Sum of every ingredient's own grams — the dish's grams after the breakdown itself changes. */
export function sumGrams(ingredients: { grams: number }[]): number {
  return ingredients.reduce((sum, ingredient) => sum + ingredient.grams, 0)
}

/** Rounds to one decimal place — mirrors the backend's `setScale(1, RoundingMode.HALF_UP)`. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

/** Turns an already-saved entry back into the shape `POST /api/food/entries` accepts — used to
 *  undo a delete by re-creating the exact same entry (same name/grams/meal/date/per-100g
 *  values/source/ingredients) rather than trying to special-case a "restore" endpoint. */
export function entryToCreateRequest(entry: FoodEntry): FoodEntryRequest {
  return {
    entryDate: entry.entryDate,
    mealType: entry.mealType,
    name: entry.name,
    grams: entry.grams,
    kcalPer100: entry.kcalPer100,
    proteinPer100: entry.proteinPer100,
    fatPer100: entry.fatPer100,
    carbsPer100: entry.carbsPer100,
    fiberPer100: entry.fiberPer100,
    sugarPer100: entry.sugarPer100,
    sodiumMgPer100: entry.sodiumMgPer100,
    source: entry.source,
    fdcId: entry.fdcId,
    ingredients: entry.ingredients ?? undefined,
  }
}

/** Converts a resolved dish (from photo/text analysis, a suggestion, a favorite, or a recent
 *  dish — anything shaped like `AnalyzedDish`) into an editable `DraftDish` for the review step.
 *  Grams round to whole numbers (min 1) since `GramsStepper` only edits whole grams; everything
 *  else carries through unchanged. Shared by AddMealPage (photo/text analysis + the Recientes/
 *  Favoritos picker) and SuggestMealsPage so there's exactly one place this mapping lives. */
export function analyzedDishToDraft(dish: AnalyzedDish): DraftDish {
  return {
    key: crypto.randomUUID(),
    name: dish.name,
    grams: Math.max(1, Math.round(dish.grams)),
    source: dish.source,
    fdcId: dish.fdcId,
    ingredients: dish.ingredients.map((ingredient) => ({
      key: crypto.randomUUID(),
      ...ingredient,
      grams: Math.max(1, Math.round(ingredient.grams)),
    })),
  }
}

/** Turns an existing favorite back into the shape `POST /api/favorites` accepts — used to undo
 *  removing one, the same way `entryToCreateRequest` undoes deleting a food entry. */
export function favoriteToCreateRequest(favorite: FavoriteDish): CreateFavoriteRequest {
  return {
    name: favorite.name,
    grams: favorite.grams,
    kcalPer100: favorite.kcalPer100,
    proteinPer100: favorite.proteinPer100,
    fatPer100: favorite.fatPer100,
    carbsPer100: favorite.carbsPer100,
    fiberPer100: favorite.fiberPer100,
    sugarPer100: favorite.sugarPer100,
    sodiumMgPer100: favorite.sodiumMgPer100,
    source: favorite.source,
    fdcId: favorite.fdcId,
    ingredients: favorite.ingredients,
    mealType: favorite.mealType ?? undefined,
  }
}
