import { formatLongDate } from '../../lib/date'
import { formatNumber } from '../../lib/format'
import type {
  ActivityLevel,
  DietaryRestriction,
  DietStyle,
  EnergySource,
  Goal,
  Pace,
  ProteinBasis,
  Sex,
  TargetNoteCode,
} from './types'

/** Shared Spanish copy for profile enum values — reused by onboarding and the profile summary. */

export const SEX_LABELS: Record<Sex, string> = {
  FEMALE: 'Femenino',
  MALE: 'Masculino',
}

export const ACTIVITY_LABELS: Record<ActivityLevel, { title: string; description: string }> = {
  SEDENTARY: { title: 'Sedentario', description: 'Poco o ningún ejercicio' },
  LIGHTLY_ACTIVE: { title: 'Ligero', description: '1 a 3 días por semana' },
  MODERATELY_ACTIVE: { title: 'Moderado', description: '3 a 5 días por semana' },
  VERY_ACTIVE: { title: 'Activo', description: '6 a 7 días por semana' },
  EXTRA_ACTIVE: {
    title: 'Muy activo',
    description: 'Trabajo físico o entrenamiento dos veces al día',
  },
}

export const GOAL_LABELS: Record<Goal, { title: string; description?: string }> = {
  LOSE_FAT: {
    title: 'Perder grasa',
    description: 'Déficit moderado y proteína alta para cuidar el músculo',
  },
  LOSE_WEIGHT: { title: 'Bajar de peso' },
  RECOMP: {
    title: 'Recomposición corporal',
    description: 'Bajar grasa y ganar músculo a la vez',
  },
  MAINTAIN: { title: 'Mantener' },
  BUILD_MUSCLE: { title: 'Ganar músculo', description: 'Superávit chico' },
  GAIN_WEIGHT: { title: 'Subir de peso' },
}

export const PACE_LABELS: Record<Pace, string> = {
  SLOW: 'Lento',
  MODERATE: 'Moderado',
  FAST: 'Rápido',
}

export const DIET_STYLE_LABELS: Record<DietStyle, { title: string; description: string }> = {
  BALANCED: {
    title: 'Equilibrada',
    description: 'Un balance parejo entre proteínas, carbohidratos y grasas',
  },
  HIGH_PROTEIN: {
    title: 'Alta en proteína',
    description: 'Más proteína para cuidar el músculo y dar saciedad',
  },
  LOW_CARB: {
    title: 'Baja en carbohidratos',
    description: 'Menos carbohidratos, con más proteínas y grasas',
  },
  KETO: {
    title: 'Cetogénica',
    description: 'Carbohidratos muy bajos; las grasas pasan a ser la principal fuente de energía',
  },
}

export const DIETARY_RESTRICTION_LABELS: Record<DietaryRestriction, string> = {
  VEGETARIAN: 'Vegetariana',
  VEGAN: 'Vegana',
  GLUTEN_FREE: 'Sin TACC',
  LACTOSE_FREE: 'Sin lactosa',
}

/** Goals with no ramp — the Ritmo step is skipped for them and `pace` stays null. */
export function needsPace(goal: Goal): boolean {
  return goal !== 'RECOMP' && goal !== 'MAINTAIN'
}

const LOSS_GOALS: ReadonlySet<Goal> = new Set<Goal>(['LOSE_FAT', 'LOSE_WEIGHT'])

/** % of current body weight moved per week, by goal family and pace — mirrors the backend calculator. */
const PACE_PERCENT: Record<'LOSS' | 'BUILD_MUSCLE' | 'GAIN_WEIGHT', Record<Pace, number>> = {
  LOSS: { SLOW: 0.5, MODERATE: 0.75, FAST: 1 },
  BUILD_MUSCLE: { SLOW: 0.25, MODERATE: 0.35, FAST: 0.5 },
  GAIN_WEIGHT: { SLOW: 0.5, MODERATE: 0.75, FAST: 1 },
}

function paceCategory(goal: Goal): 'LOSS' | 'BUILD_MUSCLE' | 'GAIN_WEIGHT' | null {
  if (LOSS_GOALS.has(goal)) return 'LOSS'
  if (goal === 'BUILD_MUSCLE') return 'BUILD_MUSCLE'
  if (goal === 'GAIN_WEIGHT') return 'GAIN_WEIGHT'
  return null
}

/** Signed kg/week preview shown on each Ritmo card — negative for the two loss goals. */
export function paceWeeklyRateKg(goal: Goal, pace: Pace, weightKg: number): number {
  const category = paceCategory(goal)
  if (!category || !Number.isFinite(weightKg)) return 0
  const magnitude = weightKg * (PACE_PERCENT[category][pace] / 100)
  return category === 'LOSS' ? -magnitude : magnitude
}

/** "Proteína calculada sobre tu masa magra (63 kg)" / "...un peso ajustado (X kg)" / "...tu peso (X kg)". */
export function proteinBasisMessage(basis: ProteinBasis, basisKg: number): string {
  const kgLabel = `${formatNumber(basisKg)} kg`
  switch (basis) {
    case 'LEAN_MASS':
      return `Proteína calculada sobre tu masa magra (${kgLabel})`
    case 'ADJUSTED_WEIGHT':
      return `Proteína calculada sobre un peso ajustado (${kgLabel})`
    case 'BODY_WEIGHT':
      return `Proteína calculada sobre tu peso (${kgLabel})`
  }
}

/** "-950 kcal/día respecto de tu mantenimiento" / "+300 kcal/día respecto de tu mantenimiento". */
export function dailyAdjustmentMessage(kcal: number): string {
  const sign = kcal > 0 ? '+' : kcal < 0 ? '−' : ''
  return `${sign}${formatNumber(Math.abs(kcal))} kcal/día respecto de tu mantenimiento`
}

const NOTE_TONE: Partial<Record<TargetNoteCode, 'info' | 'warning'>> = {
  FLOOR_APPLIED: 'info',
  RATE_CAPPED: 'warning',
  STRENGTH_TRAINING_RECOMMENDED: 'info',
  KETO_FIBER: 'warning',
}

/** Banner tone for a target note — defaults to "info" for any code the client doesn't recognize yet. */
export function noteTone(code: TargetNoteCode): 'info' | 'warning' {
  return NOTE_TONE[code] ?? 'info'
}

export interface EnergySourceMessage {
  primary: string
  /** Only set for the FORMULA case — once adaptive, there's nothing left to hint at. */
  hint?: string
}

/**
 * "Calorías ajustadas con tus datos reales desde {fecha}" once a check-in has been accepted, or
 * the formula copy plus a hint that logging will personalize it later. `energySource` is optional
 * on the wire (Sprint 3a) — anything other than ADAPTIVE (including a backend that omits the
 * field entirely) reads as the formula case.
 */
export function energySourceMessage(
  energySource: EnergySource | undefined,
  adaptiveSince: string | null | undefined,
): EnergySourceMessage {
  if (energySource === 'ADAPTIVE' && adaptiveSince) {
    return { primary: `Calorías ajustadas con tus datos reales desde ${formatLongDate(adaptiveSince)}` }
  }
  return {
    primary: 'Calorías estimadas con fórmula (Mifflin-St Jeor)',
    hint: 'Los chequeos semanales las van a personalizar con datos reales después de 2 a 3 semanas registrando comidas y peso.',
  }
}
