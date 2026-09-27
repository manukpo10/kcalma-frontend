import { MEAL_TYPE_LABELS } from '../food/labels'
import type { ReminderMealType, WeekdayCode } from './types'

export const REMINDER_MEAL_ORDER: ReminderMealType[] = ['DESAYUNO', 'ALMUERZO', 'MERIENDA', 'CENA']

export const REMINDER_MEAL_LABELS: Record<ReminderMealType, string> = {
  DESAYUNO: MEAL_TYPE_LABELS.DESAYUNO,
  ALMUERZO: MEAL_TYPE_LABELS.ALMUERZO,
  MERIENDA: MEAL_TYPE_LABELS.MERIENDA,
  CENA: MEAL_TYPE_LABELS.CENA,
}

export const WEEKDAY_ORDER: WeekdayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

/** Single-letter Spanish abbreviations (Lunes..Domingo) for the compact weigh-in day picker. */
export const WEEKDAY_LABELS: Record<WeekdayCode, string> = {
  MON: 'L',
  TUE: 'M',
  WED: 'X',
  THU: 'J',
  FRI: 'V',
  SAT: 'S',
  SUN: 'D',
}

export const WEEKDAY_FULL_LABELS: Record<WeekdayCode, string> = {
  MON: 'lunes',
  TUE: 'martes',
  WED: 'miércoles',
  THU: 'jueves',
  FRI: 'viernes',
  SAT: 'sábado',
  SUN: 'domingo',
}
