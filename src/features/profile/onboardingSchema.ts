import { z } from 'zod'
import { ageInYears } from '../../lib/date'
import { needsPace } from './labels'
import type { DietaryRestriction, DietStyle, Goal, Pace } from './types'

// Number fields stay strings here (native <input> value type) and are converted
// to numbers on submit — avoids RHF/Zod input-vs-output generic friction.

const GOAL_VALUES = [
  'LOSE_FAT',
  'LOSE_WEIGHT',
  'RECOMP',
  'MAINTAIN',
  'BUILD_MUSCLE',
  'GAIN_WEIGHT',
] as const satisfies readonly Goal[]

const PACE_VALUES = ['SLOW', 'MODERATE', 'FAST'] as const satisfies readonly Pace[]

const DIET_STYLE_VALUES = [
  'BALANCED',
  'HIGH_PROTEIN',
  'LOW_CARB',
  'KETO',
] as const satisfies readonly DietStyle[]

const DIETARY_RESTRICTION_VALUES = [
  'VEGETARIAN',
  'VEGAN',
  'GLUTEN_FREE',
  'LACTOSE_FREE',
] as const satisfies readonly DietaryRestriction[]

export const onboardingSchema = z
  .object({
    sex: z.enum(['MALE', 'FEMALE']),
    // Mirrors the backend's own 18-100 age gate (see ProfileRequest) so the client rejects the
    // same values before a round trip — message text must stay byte-for-byte identical to the
    // server's, since we show whichever one the user hits first.
    birthDate: z
      .string()
      .min(1, 'La fecha de nacimiento es obligatoria')
      .refine((value) => ageInYears(value) >= 18 && ageInYears(value) <= 100, {
        message: 'Kcalma es para personas de entre 18 y 100 años.',
      }),
    heightCm: z
      .string()
      .min(1, 'La altura es obligatoria')
      .refine((value) => Number(value) >= 50 && Number(value) <= 250, {
        message: 'La altura debe estar entre 50 y 250 cm',
      }),
    weightKg: z
      .string()
      .min(1, 'El peso es obligatorio')
      .refine((value) => Number(value) >= 20 && Number(value) <= 500, {
        message: 'El peso debe estar entre 20 y 500 kg',
      }),
    activityLevel: z.enum([
      'SEDENTARY',
      'LIGHTLY_ACTIVE',
      'MODERATELY_ACTIVE',
      'VERY_ACTIVE',
      'EXTRA_ACTIVE',
    ]),
    goal: z.enum(GOAL_VALUES),
    // null for goals with no ramp (RECOMP/MAINTAIN) — required otherwise, checked below.
    pace: z.enum(PACE_VALUES).nullable(),
    strengthTraining: z.enum(['YES', 'NO']),
    dietStyle: z.enum(DIET_STYLE_VALUES),
    dietaryRestrictions: z.array(z.enum(DIETARY_RESTRICTION_VALUES)),
    // Optional — left blank means "no goal weight set yet", validated only when provided.
    goalWeightKg: z
      .string()
      .refine((value) => !value || (Number(value) >= 30 && Number(value) <= 300), {
        message: 'El peso objetivo debe estar entre 30 y 300 kg',
      }),
    // Optional — left blank means "omitido", validated only when provided.
    bodyFatPct: z
      .string()
      .refine((value) => !value || (Number(value) >= 3 && Number(value) <= 70), {
        message: 'El % de grasa corporal debe estar entre 3 y 70',
      }),
    // Defaults to today from the UI; only sent to the API when bodyFatPct is also set.
    bodyFatMeasuredOn: z.string(),
  })
  .superRefine((values, ctx) => {
    if (needsPace(values.goal) && values.pace === null) {
      ctx.addIssue({ code: 'custom', message: 'Elegí un ritmo para tu objetivo.', path: ['pace'] })
    }
    if (values.bodyFatPct && !values.bodyFatMeasuredOn) {
      ctx.addIssue({ code: 'custom', message: 'Ingresá la fecha de la medición.', path: ['bodyFatMeasuredOn'] })
    }
  })

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
