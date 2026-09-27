export type MealType = 'DESAYUNO' | 'ALMUERZO' | 'MERIENDA' | 'CENA' | 'SNACK'

/**
 * Where a food item's nutrient values came from: PERSONAL (the user's own saved library), USDA
 * (matched USDA FoodData Central), ESTIMATED (no confident match — an AI estimate, revisable),
 * MANUAL (typed by hand, never resolved against either table), or MIXED — dish-level only: its
 * ingredients don't all agree on where their values came from.
 */
export type FoodSource = 'PERSONAL' | 'USDA' | 'ESTIMATED' | 'MANUAL' | 'MIXED'

export interface Totals {
  kcal: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sugar: number
  sodiumMg: number
}

/** Per-100g nutrition — the shape both an ingredient and a manual entry are built from. */
export interface Per100 {
  kcalPer100: number
  proteinPer100: number
  fatPer100: number
  carbsPer100: number
  fiberPer100: number
  sugarPer100: number
  sodiumMgPer100: number
}

/** One ingredient inside a dish, already resolved against the personal library/USDA reference. */
export interface Ingredient extends Per100 {
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
}

/** One DISH detected/suggested, decomposed into ingredients — a simple food is just one ingredient
 *  equal to the dish itself. `kcalPer100`..`sodiumMgPer100`/`totals` are the dish's OWN derived
 *  values (sum of its ingredients), never a value of their own. */
export interface AnalyzedDish extends Per100 {
  name: string
  grams: number
  totals: Totals
  source: FoodSource
  fdcId: number | null
  ingredients: Ingredient[]
}

export interface FoodAnalysisResponse {
  dishes: AnalyzedDish[]
  note: string | null
}

/** One saved entry's ingredient breakdown entry — same shape as `Ingredient`. */
export type FoodEntryIngredient = Ingredient

export interface FoodEntry extends Per100 {
  id: string
  entryDate: string
  mealType: MealType
  name: string
  grams: number
  totals: Totals
  source: FoodSource
  fdcId: number | null
  /** `null` for any entry logged before ingredient breakdowns shipped — never an empty array. */
  ingredients: FoodEntryIngredient[] | null
  createdAt: string
  updatedAt: string
}

export interface FoodEntryIngredientRequest extends Per100 {
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
}

export interface FoodEntryRequest extends Per100 {
  entryDate: string
  mealType: MealType
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
  /** Optional: a request without a breakdown gets a single server-side ingredient equal to the dish. */
  ingredients?: FoodEntryIngredientRequest[]
}

export interface UpdateFoodEntryRequest {
  grams: number
  mealType: MealType
  /** Present only when the ingredients section itself was edited — see `EditEntryModal`. */
  ingredients?: FoodEntryIngredientRequest[]
}

/** A detected/suggested ingredient while it's still being edited, before it's saved. */
export interface DraftIngredient extends Per100 {
  key: string
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
}

/** A detected/suggested/manual DISH while it's still being edited, before it's saved. `grams` and
 *  `source` are kept in sync with `ingredients` (see `sumGrams`/`combineSources` in nutritionMath)
 *  every time the breakdown itself changes, so a save always reflects the current ingredient set. */
export interface DraftDish {
  key: string
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
  ingredients: DraftIngredient[]
}

/** A saved favorite — the same analyzed-dish shape (name/grams/per-100g/ingredients/source/fdcId)
 *  plus the favorite's own id, the meal type it was saved under (if any), and when it was added. */
export interface FavoriteDish extends AnalyzedDish {
  id: string
  mealType: MealType | null
  createdAt: string
}

/** One dish the user has logged before, aggregated across every day it was eaten — same
 *  analyzed-dish shape plus how/when it was last logged. */
export interface RecentDish extends AnalyzedDish {
  lastMealType: MealType
  timesLogged: number
  lastLoggedOn: string
}

/** POST /api/favorites body: either an existing saved entry's id, or a full dish payload (the
 *  same shape a `FoodEntryRequest` sends, minus `entryDate`) — both take an optional `mealType`. */
export type CreateFavoriteRequest =
  | { entryId: string; mealType?: MealType }
  | (Per100 & {
      name: string
      grams: number
      source: FoodSource
      fdcId: number | null
      ingredients?: FoodEntryIngredientRequest[]
      mealType?: MealType
    })
