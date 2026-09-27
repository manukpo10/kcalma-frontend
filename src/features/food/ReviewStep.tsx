import { X } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FavoriteStarButton } from '../../components/ui/FavoriteStarButton'
import { MacroChips } from '../../components/ui/MacroChips'
import { SourceBadge } from '../../components/ui/SourceBadge'
import { formatNumber } from '../../lib/format'
import { GramsStepper } from './GramsStepper'
import { IngredientsSection } from './IngredientsSection'
import { MealTypePicker } from './MealTypePicker'
import { computeDishTotals, per100FromTotals } from './nutritionMath'
import type { DraftDish, MealType } from './types'
import { useAddFavorite, useRemoveFavorite } from './useFavorites'

export interface DayPreview {
  newKcal: number
  targetKcal: number
  newSugar: number
  sugarMax: number
  newSodium: number
  sodiumMax: number
}

interface ReviewStepProps {
  dishes: DraftDish[]
  onChangeDishGrams: (key: string, grams: number) => void
  onRemoveDish: (key: string) => void
  onChangeIngredientGrams: (dishKey: string, ingredientKey: string, grams: number) => void
  onRemoveIngredient: (dishKey: string, ingredientKey: string) => void
  mealType: MealType
  onMealTypeChange: (mealType: MealType) => void
  note: string | null
  preview: DayPreview | null
  onSave: () => void
  saving: boolean
  saveError: string | null
}

/** Editable list of detected/added DISHES, meal type, and a preview of how the day ends. */
export function ReviewStep({
  dishes,
  onChangeDishGrams,
  onRemoveDish,
  onChangeIngredientGrams,
  onRemoveIngredient,
  mealType,
  onMealTypeChange,
  note,
  preview,
  onSave,
  saving,
  saveError,
}: ReviewStepProps) {
  // Session-local: favoriting returns a new favorite id, not a link back to this draft dish, so
  // "is this one already favorited" only tracks what happened on THIS screen (see FavoriteStarButton).
  const [favoriteIdByDishKey, setFavoriteIdByDishKey] = useState<Record<string, string>>({})
  const [togglingDishKey, setTogglingDishKey] = useState<string | null>(null)
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const handleToggleFavorite = async (dish: DraftDish) => {
    setTogglingDishKey(dish.key)
    try {
      const existingId = favoriteIdByDishKey[dish.key]
      if (existingId) {
        await removeFavorite.mutateAsync(existingId)
        setFavoriteIdByDishKey((current) => {
          const next = { ...current }
          delete next[dish.key]
          return next
        })
      } else {
        const totals = computeDishTotals(dish.ingredients)
        const per100 = per100FromTotals(totals, dish.grams)
        const created = await addFavorite.mutateAsync({
          name: dish.name,
          grams: dish.grams,
          ...per100,
          source: dish.source,
          fdcId: dish.fdcId,
          mealType,
          ingredients: dish.ingredients.map((ingredient) => ({
            name: ingredient.name,
            grams: ingredient.grams,
            kcalPer100: ingredient.kcalPer100,
            proteinPer100: ingredient.proteinPer100,
            fatPer100: ingredient.fatPer100,
            carbsPer100: ingredient.carbsPer100,
            fiberPer100: ingredient.fiberPer100,
            sugarPer100: ingredient.sugarPer100,
            sodiumMgPer100: ingredient.sodiumMgPer100,
            source: ingredient.source,
            fdcId: ingredient.fdcId,
          })),
        })
        setFavoriteIdByDishKey((current) => ({ ...current, [dish.key]: created.id }))
      }
    } finally {
      setTogglingDishKey(null)
    }
  }

  return (
    <div className="space-y-5">
      {note && dishes.length === 0 && <Banner tone="warning">{note}</Banner>}
      {note && dishes.length > 0 && <Banner tone="info">{note}</Banner>}

      {dishes.length > 0 && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Comida</p>
            <MealTypePicker value={mealType} onChange={onMealTypeChange} />
          </div>

          <div className="space-y-3">
            {dishes.map((dish) => {
              const totals = computeDishTotals(dish.ingredients)
              return (
                <Card key={dish.key} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-ink capitalize">
                      {dish.name} <SourceBadge source={dish.source} className="ml-1" />
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemoveDish(dish.key)}
                      aria-label={`Quitar ${dish.name}`}
                      className="text-ink-muted transition-colors hover:text-danger"
                    >
                      <X className="size-5" aria-hidden="true" />
                    </button>
                  </div>
                  <GramsStepper value={dish.grams} onChange={(grams) => onChangeDishGrams(dish.key, grams)} />
                  <MacroChips kcal={totals.kcal} protein={totals.protein} fat={totals.fat} carbs={totals.carbs} />
                  <FavoriteStarButton
                    favorited={Boolean(favoriteIdByDishKey[dish.key])}
                    onToggle={() => void handleToggleFavorite(dish)}
                    disabled={togglingDishKey === dish.key}
                    label="Guardar como favorito"
                    favoritedLabel="Guardado como favorito"
                  />
                  <IngredientsSection
                    ingredients={dish.ingredients}
                    onChangeGrams={(ingredientKey, grams) => onChangeIngredientGrams(dish.key, ingredientKey, grams)}
                    onRemove={(ingredientKey) => onRemoveIngredient(dish.key, ingredientKey)}
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
