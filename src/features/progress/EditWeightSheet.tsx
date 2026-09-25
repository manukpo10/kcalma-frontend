import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatLongDate } from '../../lib/date'
import type { WeightPoint } from './types'
import { useDeleteWeight, useUpsertWeight } from './useProgress'

interface EditWeightSheetProps {
  point: WeightPoint
  onClose: () => void
  onSaved: (targetsUpdated: boolean) => void
}

const MIN_WEIGHT_KG = 30
const MAX_WEIGHT_KG = 300

/** Pencil-affordance sheet for one weigh-in: edit its weight or delete it — mirrors EditEntryModal. */
export function EditWeightSheet({ point, onClose, onSaved }: EditWeightSheetProps) {
  const [weight, setWeight] = useState(String(point.weightKg).replace('.', ','))
  const [validationError, setValidationError] = useState<string | null>(null)

  const upsertWeight = useUpsertWeight()
  const deleteWeight = useDeleteWeight()

  const handleSave = async () => {
    const parsed = Number(weight.replace(',', '.'))
    if (!weight.trim() || Number.isNaN(parsed)) {
      setValidationError('Ingresá un peso válido.')
      return
    }
    if (parsed < MIN_WEIGHT_KG || parsed > MAX_WEIGHT_KG) {
      setValidationError(`El peso debe estar entre ${MIN_WEIGHT_KG} y ${MAX_WEIGHT_KG} kg.`)
      return
    }
    setValidationError(null)

    const response = await upsertWeight.mutateAsync({ date: point.date, weightKg: Math.round(parsed * 10) / 10 })
    onSaved(response.targetsUpdated)
    onClose()
  }

  const handleDelete = async () => {
    await deleteWeight.mutateAsync(point.date)
    onClose()
  }

  const error =
    validationError ??
    (upsertWeight.error instanceof Error
      ? upsertWeight.error.message
      : deleteWeight.error instanceof Error
        ? deleteWeight.error.message
        : null)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Editar peso del ${formatLongDate(point.date)}`}
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-surface p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-lg sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-1 text-lg font-bold text-ink capitalize">{formatLongDate(point.date)}</p>
        <p className="mb-5 text-sm text-ink-muted">Editá el peso registrado ese día o eliminá el registro.</p>

        <div className="mb-5">
          <Input
            label="Peso"
            type="text"
            inputMode="decimal"
            autoFocus
            trailing={<span className="text-sm font-medium text-ink-muted">kg</span>}
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
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
              loading={deleteWeight.isPending}
              onClick={() => void handleDelete()}
            >
              Eliminar
            </Button>
          </div>
          <div className="flex-1">
            <Button loading={upsertWeight.isPending} onClick={() => void handleSave()}>
              Guardar
            </Button>
          </div>
        </div>
        <Button variant="ghost" className="mt-2" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
