/** The 4 scheduled meals a reminder can fire for — SNACK (see food/types.ts) has no reminder. */
export type ReminderMealType = 'DESAYUNO' | 'ALMUERZO' | 'MERIENDA' | 'CENA'

export type WeekdayCode = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface MealReminderSetting {
  enabled: boolean
  /** "HH:mm", local time. */
  time: string
}

export interface WaterReminderSetting {
  enabled: boolean
  everyHours: number
  /** "HH:mm" — reminders only fire inside [from, to). */
  from: string
  to: string
}

export interface WeighInReminderSetting {
  enabled: boolean
  days: WeekdayCode[]
  time: string
}

/** GET/PUT /api/reminders body — see backend contract. */
export interface ReminderSettings {
  enabled: boolean
  meals: Record<ReminderMealType, MealReminderSetting>
  water: WaterReminderSetting
  weighIn: WeighInReminderSetting
}

/** POST /api/push/subscriptions body: the browser's own subscription JSON plus a hint for the
 *  backend's device list — never anything sensitive, just `navigator.userAgent`. */
export type PushSubscriptionRequest = PushSubscriptionJSON & { userAgent?: string }
