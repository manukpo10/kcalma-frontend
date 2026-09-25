import type { MealType } from './types'

export const MEAL_TYPE_ORDER: MealType[] = ['DESAYUNO', 'ALMUERZO', 'MERIENDA', 'CENA', 'SNACK']

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  DESAYUNO: 'Desayuno',
  ALMUERZO: 'Almuerzo',
  MERIENDA: 'Merienda',
  CENA: 'Cena',
  SNACK: 'Snack',
}

/** Preselects a meal type from the current hour — always editable afterwards. */
export function mealTypeForNow(date: Date = new Date()): MealType {
  const hour = date.getHours()
  if (hour < 11) return 'DESAYUNO'
  if (hour < 16) return 'ALMUERZO'
  if (hour < 19) return 'MERIENDA'
  if (hour < 23) return 'CENA'
  return 'SNACK'
}
