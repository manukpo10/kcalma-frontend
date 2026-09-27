import type { CheckinConfidence, CheckinStatus } from './types'

/** Shown next to each row of the "Ajustes semanales" history list. */
export const CHECKIN_STATUS_LABELS: Record<CheckinStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aplicado',
  DISMISSED: 'Sin cambios',
  INSUFFICIENT_DATA: 'Datos insuficientes',
}

interface ConfidenceInfo {
  title: string
  /** One-line meaning shown under the confidence label in the detail sheet. */
  meaning: string
}

const CONFIDENCE_LABELS: Record<CheckinConfidence, ConfidenceInfo> = {
  HIGH: {
    title: 'Alta',
    meaning: 'Los datos de la semana son consistentes: la propuesta es confiable.',
  },
  MEDIUM: {
    title: 'Media',
    meaning: 'Hay datos suficientes, aunque con algo de variación entre días.',
  },
  LOW: {
    title: 'Baja',
    meaning: 'Hay pocos datos o son inconsistentes; conviene tomar la propuesta como referencia.',
  },
}

/** Falls back to the LOW copy for any value outside the current union, so an older/newer backend
 *  enum never breaks the detail sheet. */
export function confidenceInfo(confidence: CheckinConfidence): ConfidenceInfo {
  return CONFIDENCE_LABELS[confidence] ?? CONFIDENCE_LABELS.LOW
}
