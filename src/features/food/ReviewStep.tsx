import { X } from 'lucide-react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { MacroChips } from '../../components/ui/MacroChips'
import { formatNumber } from '../../lib/format'
import { GramsStepper } from './GramsStepper'
import { MealTypePicker } from './MealTypePicker'
import { computeTotals } from './nutritionMath'
import type { DraftItem, MealType } from './types'

export interface DayPreview {
  newKcal: number
  targetKcal: number
  newSugar: number
  sugarMax: number
  newSodium: number
  sodiumMax: number
}

interface ReviewStepProps {
  items: DraftItem[]
  onChangeItem: (key: string, patch: Partial<DraftItem>) => void
  onRemoveItem: (key: string) => void
  mealType: MealType
  onMealTypeChange: (mealType: MealType) => void
  note: string | null
  preview: DayPreview | null
  onSave: () => void
  saving: boolean
  saveError: string | null
}

/** Editable list of detected/added items, meal type, and a preview of how the day ends. */
export function ReviewStep({
  items,
  onChangeItem,
  onRemoveItem,
  mealType,
  onMealTypeChange,
  note,
  preview,
  onSave,
  saving,
  saveError,
}: ReviewStepProps) {
  return (
    <div className="space-y-5">
      {note && items.length === 0 && <Banner tone="warning">{note}</Banner>}
      {note && items.length > 0 && <Banner tone="info">{note}</Banner>}

      {items.length > 0 && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Comida</p>
            <MealTypePicker value={mealType} onChange={onMealTypeChange} />
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const totals = computeTotals(item, item.grams)
              return (
                <Card key={item.key} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-ink capitalize">{item.name}</p>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.key)}
                      aria-label={`Quitar ${item.name}`}
                      className="text-ink-muted transition-colors hover:text-danger"
                    >
                      <X className="size-5" aria-hidden="true" />
                    </button>
                  </div>
                  <GramsStepper value={item.grams} onChange={(grams) => onChangeItem(item.key, { grams })} />
                  <MacroChips
                    kcal={totals.kcal}
                    protein={totals.protein}
                    fat={totals.fat}
                    carbs={totals.carbs}
                  />
                </Card>
              )
            })}
          </div>

          {preview && (
            <Banner tone={preview.newKcal > preview.targetKcal ? 'warning' : 'success'}>
              {preview.newKcal > preview.targetKcal
                ? `Con esto te pasás por ${formatNumber(preview.newKcal - preview.targetKcal)} kcal (llegás a ${formatNumber(preview.newKcal)} de ${formatNumber(preview.targetKcal)}).`
                : `Con esto llegás a ${formatNumber(preview.newKcal)} de ${formatNumber(preview.targetKcal)} kcal.`}
            </Banner>
          )}
          {preview && preview.newSugar > preview.sugarMax && (
            <Banner tone="danger">Con esto superás el máximo de azúcar del día.</Banner>
          )}
          {preview && preview.newSodium > preview.sodiumMax && (
            <Banner tone="danger">Con esto superás el máximo de sodio del día.</Banner>
          )}

          {saveError && <Banner tone="danger">{saveError}</Banner>}

          <Button size="lg" loading={saving} onClick={onSave}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </>
      )}
    </div>
  )
}
