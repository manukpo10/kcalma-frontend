import { Trash2 } from 'lucide-react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { formatNumber } from '../../lib/format'
import { mealTypeCompleteLabel } from '../food/labels'
import type { FoodEntry, MealType } from '../food/types'
import { useDeleteMeal } from '../food/useFoodEntries'

interface DeleteMealModalProps {
  date: string
  mealType: MealType
  entries: FoodEntry[]
  onClose: () => void
}

/** Bottom-sheet confirmation opened from a meal group's trash button: wipes every entry of that meal/day at once. */
export function DeleteMealModal({ date, mealType, entries, onClose }: DeleteMealModalProps) {
  const deleteMeal = useDeleteMeal()

  const itemCount = entries.length
  const totalKcal = entries.reduce((sum, entry) => sum + entry.totals.kcal, 0)
  const label = mealTypeCompleteLabel(mealType)

  const handleDelete = async () => {
    await deleteMeal.mutateAsync({ date, mealType })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`¿Eliminar ${label}?`}
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-surface p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-lg sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-1 text-lg font-bold text-ink">¿Eliminar {label}?</p>
        <p className="mb-5 text-sm text-ink-muted">
          Se {itemCount === 1 ? 'va' : 'van'} a borrar {itemCount} {itemCount === 1 ? 'alimento' : 'alimentos'} (
          {formatNumber(totalKcal)} kcal)
        </p>

        {deleteMeal.error && (
          <Banner tone="danger" className="mb-4">
            {deleteMeal.error instanceof Error ? deleteMeal.error.message : 'Ocurrió un error.'}
          </Banner>
        )}

        <Button
          variant="danger"
          icon={<Trash2 className="size-5" aria-hidden="true" />}
          loading={deleteMeal.isPending}
          onClick={() => void handleDelete()}
        >
          Eliminar
        </Button>
        <Button variant="ghost" className="mt-2" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
