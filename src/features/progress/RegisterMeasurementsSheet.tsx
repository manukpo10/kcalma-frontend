import { Ruler } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { todayIso } from '../../lib/date'
import { MEASUREMENT_METRICS } from './measurementLabels'
import type { MeasurementField, MeasurementRequest } from './types'
import { useUpsertMeasurement } from './useMeasurements'

interface RegisterMeasurementsSheetProps {
  onClose: () => void
  onSaved: () => void
}

type FormValues = Partial<Record<MeasurementField, string>>

/** Parses every filled-in field into the PUT body, or returns a validation message. All fields
 *  are optional, but at least one must be present and every present one must be a valid,
 *  non-negative number — shared by the register and edit sheets. */
function parseMeasurementForm(values: FormValues): { body: MeasurementRequest } | { error: string } {
  const body: MeasurementRequest = {}
  for (const metric of MEASUREMENT_METRICS) {
    const raw = values[metric.key]?.trim()
    if (!raw) continue
    const parsed = Number(raw.replace(',', '.'))
    if (Number.isNaN(parsed) || parsed < 0) {
      return { error: `${metric.label}: ingresá un valor válido.` }
    }
    body[metric.key] = parsed
  }
  if (Object.keys(body).length === 0) {
    return { error: 'Completá al menos una medida.' }
  }
  return { body }
}

/** "Registrar medidas" bottom sheet: date (default today) + up to 7 optional fields, at least
 *  one required — mirrors RegisterWeightSheet's validate-then-upsert shape. */
export function RegisterMeasurementsSheet({ onClose, onSaved }: RegisterMeasurementsSheetProps) {
  const [date, setDate] = useState(todayIso())
  const [values, setValues] = useState<FormValues>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  const upsertMeasurement = useUpsertMeasurement()

  const handleChange = (key: MeasurementField, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async () => {
    const result = parseMeasurementForm(values)
    if ('error' in result) {
      setValidationError(result.error)
      return
    }
    setValidationError(null)

    await upsertMeasurement.mutateAsync({ date, ...result.body })
    onSaved()
    onClose()
  }

  const error = validationError ?? (upsertMeasurement.error instanceof Error ? upsertMeasurement.error.message : null)

  return (
    <Sheet onClose={onClose} ariaLabel="Registrar medidas">
      <p className="mb-5 flex items-center gap-2 text-lg font-bold text-ink">
        <Ruler className="size-5 text-primary-400" aria-hidden="true" />
        Registrar medidas
      </p>

      <div className="mb-4">
        <Input label="Fecha" type="date" max={todayIso()} value={date} onChange={(event) => setDate(event.target.value)} />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {MEASUREMENT_METRICS.map((metric) => (
          <Input
            key={metric.key}
            label={metric.label}
            type="text"
            inputMode="decimal"
            placeholder="0"
            trailing={<span className="text-xs font-medium text-ink-muted">{metric.unit}</span>}
            value={values[metric.key] ?? ''}
            onChange={(event) => handleChange(metric.key, event.target.value)}
          />
        ))}
      </div>

      {error && (
        <Banner tone="danger" className="mb-4">
          {error}
        </Banner>
      )}

      <Button loading={upsertMeasurement.isPending} onClick={() => void handleSave()}>
        Guardar
      </Button>
      <Button variant="ghost" className="mt-2" onClick={onClose}>
        Cancelar
      </Button>
    </Sheet>
  )
}
