import type { MealType } from './types'

export const MEAL_TYPE_ORDER: MealType[] = ['DESAYUNO', 'ALMUERZO', 'MERIENDA', 'CENA', 'SNACK']

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  DESAYUNO: 'Desayuno',
  ALMUERZO: 'Almuerzo',
  MERIENDA: 'Merienda',
  CENA: 'Cena',
  SNACK: 'Snack',
}

/** Grammatical gender per meal name — needed to agree "el/la" + "completo/completa" in copy. */
const MEAL_TYPE_FEMININE: Record<MealType, boolean> = {
  DESAYUNO: false,
  ALMUERZO: false,
  MERIENDA: true,
  CENA: true,
  SNACK: false,
}

/** e.g. "el desayuno completo" / "la merienda completa" — for the delete-whole-meal confirmation. */
export function mealTypeCompleteLabel(mealType: MealType): string {
  const feminine = MEAL_TYPE_FEMININE[mealType]
  const article = feminine ? 'la' : 'el'
  const adjective = feminine ? 'completa' : 'completo'
  return `${article} ${MEAL_TYPE_LABELS[mealType].toLowerCase()} ${adjective}`
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
