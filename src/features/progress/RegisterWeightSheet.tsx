import { Scale } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { todayIso } from '../../lib/date'
import { useUpsertWeight } from './useProgress'

interface RegisterWeightSheetProps {
  onClose: () => void
  onSaved: (targetsUpdated: boolean) => void
}

const MIN_WEIGHT_KG = 30
const MAX_WEIGHT_KG = 300

/** "Registrar peso" bottom sheet: date (default today) + weight, upserts via PUT /api/weights/{date}. */
export function RegisterWeightSheet({ onClose, onSaved }: RegisterWeightSheetProps) {
  const [date, setDate] = useState(todayIso())
  const [weight, setWeight] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const upsertWeight = useUpsertWeight()

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

    const response = await upsertWeight.mutateAsync({ date, weightKg: Math.round(parsed * 10) / 10 })
    onSaved(response.targetsUpdated)
    onClose()
  }

  const error = validationError ?? (upsertWeight.error instanceof Error ? upsertWeight.error.message : null)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Registrar peso"
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-surface p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-lg sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-5 flex items-center gap-2 text-lg font-bold text-ink">
          <Scale className="size-5 text-primary-400" aria-hidden="true" />
          Registrar peso
        </p>

        <div className="mb-4">
          <Input label="Fecha" type="date" max={todayIso()} value={date} onChange={(event) => setDate(event.target.value)} />
        </div>

        <div className="mb-5">
          <Input
            label="Peso"
            type="text"
            inputMode="decimal"
            placeholder="70,0"
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

        <Button loading={upsertWeight.isPending} onClick={() => void handleSave()}>
          Guardar
        </Button>
        <Button variant="ghost" className="mt-2" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
