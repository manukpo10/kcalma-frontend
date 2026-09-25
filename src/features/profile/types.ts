export type Sex = 'MALE' | 'FEMALE'

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE'

export type Goal = 'LOSE' | 'MAINTAIN' | 'GAIN'

export interface ProfileResponse {
  userId: string
  sex: Sex
  birthDate: string
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: Goal
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
}
