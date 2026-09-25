import type { ActivityLevel, Goal, Sex } from './types'

/** Shared Spanish copy for profile enum values — reused by onboarding and the home summary. */

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

export const GOAL_LABELS: Record<Goal, string> = {
  LOSE: 'Bajar de peso',
  MAINTAIN: 'Mantener',
  GAIN: 'Subir de peso',
}
