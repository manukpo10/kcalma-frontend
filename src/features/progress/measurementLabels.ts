import type { MeasurementField } from './types'

export interface MeasurementMetric {
  key: MeasurementField
  /** Full label — used as the register/edit form's field label. */
  label: string
  /** Compact label — used by the chart's metric-selector pills. */
  shortLabel: string
  unit: string
}

/** Order mirrors the product spec (cintura, cadera, pecho, brazo, muslo, % grasa, masa
 *  muscular) — reused for the register/edit form fields and the chart's metric selector so both
 *  always list the same 7 metrics in the same order. */
export const MEASUREMENT_METRICS: MeasurementMetric[] = [
  { key: 'waistCm', label: 'Cintura', shortLabel: 'Cintura', unit: 'cm' },
  { key: 'hipCm', label: 'Cadera', shortLabel: 'Cadera', unit: 'cm' },
  { key: 'chestCm', label: 'Pecho', shortLabel: 'Pecho', unit: 'cm' },
  { key: 'armCm', label: 'Brazo', shortLabel: 'Brazo', unit: 'cm' },
  { key: 'thighCm', label: 'Muslo', shortLabel: 'Muslo', unit: 'cm' },
  { key: 'bodyFatPct', label: '% de grasa corporal', shortLabel: '% grasa', unit: '%' },
  { key: 'muscleMassKg', label: 'Masa muscular', shortLabel: 'Masa musc.', unit: 'kg' },
]
