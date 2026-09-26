import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { MacroChips } from '../../components/ui/MacroChips'
import { SourceBadge } from '../../components/ui/SourceBadge'
import { GramsStepper } from '../food/GramsStepper'
import { MealTypePicker } from '../food/MealTypePicker'
import { computeTotals } from '../food/nutritionMath'
import type { FoodEntry, MealType } from '../food/types'
import { useDeleteFoodEntry, useUpdateFoodEntry } from '../food/useFoodEntries'

interface EditEntryModalProps {
  entry: FoodEntry
  onClose: () => void
}

/** Bottom-sheet-style dialog opened by tapping a logged item: edit its grams/meal, or delete it. */
export function EditEntryModal({ entry, onClose }: EditEntryModalProps) {
  const [grams, setGrams] = useState(entry.grams)
  const [mealType, setMealType] = useState<MealType>(entry.mealType)

  const updateEntry = useUpdateFoodEntry()
  const deleteEntry = useDeleteFoodEntry()

  const totals = computeTotals(entry, grams)
  const error = updateEntry.error ?? deleteEntry.error

  const handleSave = async () => {
    await updateEntry.mutateAsync({ id: entry.id, grams, mealType })
    onClose()
  }

  const handleDelete = async () => {
    await deleteEntry.mutateAsync(entry.id)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Editar ${entry.name}`}
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-surface p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-lg sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-1 text-lg font-bold text-ink capitalize">
          {entry.name} <SourceBadge source={entry.source} className="ml-1" />
        </p>
        <MacroChips
          kcal={totals.kcal}
          protein={totals.protein}
          fat={totals.fat}
          carbs={totals.carbs}
          className="mb-5"
        />

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-ink">Gramos</p>
          <GramsStepper value={grams} onChange={setGrams} />
        </div>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-ink">Comida</p>
          <MealTypePicker value={mealType} onChange={setMealType} />
        </div>

        {error && <Banner tone="danger" className="mb-4">{error instanceof Error ? error.message : 'Ocurrió un error.'}</Banner>}

        <div className="flex gap-3">
          <div className="flex-1">
            <Button
              variant="danger"
              icon={<Trash2 className="size-5" aria-hidden="true" />}
              loading={deleteEntry.isPending}
              onClick={() => void handleDelete()}
            >
              Eliminar
            </Button>
          </div>
          <div className="flex-1">
            <Button loading={updateEntry.isPending} onClick={() => void handleSave()}>
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
