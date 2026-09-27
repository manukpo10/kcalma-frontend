export type Sex = 'MALE' | 'FEMALE'

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE'

export type Goal = 'LOSE_FAT' | 'LOSE_WEIGHT' | 'RECOMP' | 'MAINTAIN' | 'BUILD_MUSCLE' | 'GAIN_WEIGHT'

/** Required for the four goals with a ramp (LOSE_FAT, LOSE_WEIGHT, BUILD_MUSCLE, GAIN_WEIGHT); null for RECOMP/MAINTAIN. */
export type Pace = 'SLOW' | 'MODERATE' | 'FAST'

export type DietStyle = 'BALANCED' | 'HIGH_PROTEIN' | 'LOW_CARB' | 'KETO'

export type DietaryRestriction = 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'LACTOSE_FREE'

/** What the protein target is calculated on. */
export type ProteinBasis = 'LEAN_MASS' | 'ADJUSTED_WEIGHT' | 'BODY_WEIGHT'

export type TargetNoteCode =
  | 'FLOOR_APPLIED'
  | 'RATE_CAPPED'
  | 'STRENGTH_TRAINING_RECOMMENDED'
  | 'KETO_FIBER'

/** Server-authored explanation shown as-is — never re-worded on the client. */
export interface TargetNote {
  code: TargetNoteCode
  message: string
}

export interface ProfileResponse {
  userId: string
  sex: Sex
  birthDate: string
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: Goal
  pace: Pace | null
  dietStyle: DietStyle
  dietaryRestrictions: DietaryRestriction[]
  strengthTraining: boolean
  bodyFatPct: number | null
  bodyFatMeasuredOn: string | null
  goalWeightKg: number | null
  createdAt: string
  updatedAt: string
}

export interface NutritionTargetsResponse {
  calories: number
  floorApplied: boolean
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  fiberGrams: number
  sugarMaxGrams: number
  sodiumMaxMg: number
  waterMl: number
  /** Signed kg/week the plan is currently aiming for (negative = losing). */
  weeklyRateKg: number
  /** Signed kcal/day versus maintenance (negative = deficit, positive = surplus). */
  dailyAdjustmentKcal: number
  proteinBasis: ProteinBasis
  /** The weight, in kg, `proteinBasis` was actually calculated on. */
  proteinBasisKg: number
  /** Only present once body-fat % has been recorded. */
  leanMassKg: number | null
  notes: TargetNote[]
}

export interface ProfileWithTargets {
  profile: ProfileResponse
  targets: NutritionTargetsResponse
}

export interface ProfileRequest {
  sex: Sex
  birthDate: string
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: Goal
  pace: Pace | null
  dietStyle: DietStyle
  dietaryRestrictions: DietaryRestriction[]
  strengthTraining: boolean
  bodyFatPct: number | null
  bodyFatMeasuredOn: string | null
  goalWeightKg: number | null
}
