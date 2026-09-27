import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { formatLongDate } from '../../lib/date'
import { MEASUREMENT_METRICS } from './measurementLabels'
import type { MeasurementEntry, MeasurementField, MeasurementRequest } from './types'
import { useDeleteMeasurement, useUpsertMeasurement } from './useMeasurements'

interface EditMeasurementSheetProps {
  entry: MeasurementEntry
  onClose: () => void
  onSaved: () => void
}

type FormValues = Partial<Record<MeasurementField, string>>

function toFormValues(entry: MeasurementEntry): FormValues {
  const values: FormValues = {}
  for (const metric of MEASUREMENT_METRICS) {
    const value = entry[metric.key]
    if (value !== null) values[metric.key] = String(value).replace('.', ',')
  }
  return values
}

/** Parses every filled-in field into the PUT body, or returns a validation message — same rules
 *  as RegisterMeasurementsSheet (kept separate rather than shared, same as RegisterWeightSheet/
 *  EditWeightSheet's own validation not being shared either). */
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

/** Pencil-affordance sheet for one day's measurements: edit any field or delete the whole entry — mirrors EditWeightSheet. */
export function EditMeasurementSheet({ entry, onClose, onSaved }: EditMeasurementSheetProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(entry))
  const [validationError, setValidationError] = useState<string | null>(null)

  const upsertMeasurement = useUpsertMeasurement()
  const deleteMeasurement = useDeleteMeasurement()

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

    await upsertMeasurement.mutateAsync({ date: entry.date, ...result.body })
    onSaved()
    onClose()
  }

  const handleDelete = async () => {
    await deleteMeasurement.mutateAsync(entry.date)
    onSaved()
    onClose()
  }

  const error =
    validationError ??
    (upsertMeasurement.error instanceof Error
      ? upsertMeasurement.error.message
      : deleteMeasurement.error instanceof Error
        ? deleteMeasurement.error.message
        : null)

  return (
    <Sheet onClose={onClose} ariaLabel={`Editar medidas del ${formatLongDate(entry.date)}`}>
      <p className="mb-1 text-lg font-bold text-ink capitalize">{formatLongDate(entry.date)}</p>
      <p className="mb-5 text-sm text-ink-muted">Editá tus medidas de ese día o eliminá el registro.</p>

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

      <div className="flex gap-3">
        <div className="flex-1">
          <Button
            variant="danger"
            icon={<Trash2 className="size-5" aria-hidden="true" />}
            loading={deleteMeasurement.isPending}
            onClick={() => void handleDelete()}
          >
            Eliminar
          </Button>
        </div>
        <div className="flex-1">
          <Button loading={upsertMeasurement.isPending} onClick={() => void handleSave()}>
            Guardar
          </Button>
        </div>
      </div>
      <Button variant="ghost" className="mt-2" onClick={onClose}>
        Cancelar
      </Button>
    </Sheet>
  )
}
