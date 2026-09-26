export type MealType = 'DESAYUNO' | 'ALMUERZO' | 'MERIENDA' | 'CENA' | 'SNACK'

/**
 * Where a food item's nutrient values came from: PERSONAL (the user's own saved library), USDA
 * (matched USDA FoodData Central), ESTIMATED (no confident match — an AI estimate, revisable), or
 * MANUAL (typed by hand, never resolved against either table).
 */
export type FoodSource = 'PERSONAL' | 'USDA' | 'ESTIMATED' | 'MANUAL'

export interface Totals {
  kcal: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sugar: number
  sodiumMg: number
}

/** Per-100g nutrition — the shape both a detected item and a manual entry are built from. */
export interface Per100 {
  kcalPer100: number
  proteinPer100: number
  fatPer100: number
  carbsPer100: number
  fiberPer100: number
  sugarPer100: number
  sodiumMgPer100: number
}

export interface FoodEntry extends Per100 {
  id: string
  entryDate: string
  mealType: MealType
  name: string
  grams: number
  totals: Totals
  source: FoodSource
  fdcId: number | null
  createdAt: string
  updatedAt: string
}

export interface AnalyzedItem extends Per100 {
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
}

export interface FoodAnalysisResponse {
  items: AnalyzedItem[]
  note: string | null
}

export interface FoodEntryRequest extends Per100 {
  entryDate: string
  mealType: MealType
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
}

export interface UpdateFoodEntryRequest {
  grams: number
  mealType: MealType
}

/** A detected or manually-added item while it's still being edited, before it's saved. */
export interface DraftItem extends Per100 {
  key: string
  name: string
  grams: number
  source: FoodSource
  fdcId: number | null
}
