import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { FavoriteStarButton } from '../../components/ui/FavoriteStarButton'
import { MacroChips } from '../../components/ui/MacroChips'
import { Sheet } from '../../components/ui/Sheet'
import { SourceBadge } from '../../components/ui/SourceBadge'
import { useToast } from '../../components/ui/ToastProvider'
import { GramsStepper } from '../food/GramsStepper'
import { IngredientsSection } from '../food/IngredientsSection'
import { MealTypePicker } from '../food/MealTypePicker'
import { computeDishTotals, computeTotals, entryToCreateRequest, round1, sumGrams } from '../food/nutritionMath'
import type { DraftIngredient, FoodEntry, MealType } from '../food/types'
import { useAddFavorite, useRemoveFavorite } from '../food/useFavorites'
import { useDeleteFoodEntry, useSaveFoodEntries, useUpdateFoodEntry } from '../food/useFoodEntries'

interface EditEntryModalProps {
  entry: FoodEntry
  onClose: () => void
}

function toDraftIngredients(entry: FoodEntry): DraftIngredient[] | null {
  if (!entry.ingredients) return null
  return entry.ingredients.map((ingredient) => ({ key: crypto.randomUUID(), ...ingredient }))
}

/** Bottom-sheet-style dialog opened by tapping a logged item: edit its grams/meal/ingredients, or delete it. */
export function EditEntryModal({ entry, onClose }: EditEntryModalProps) {
  const [grams, setGrams] = useState(entry.grams)
  const [mealType, setMealType] = useState<MealType>(entry.mealType)
  // null for any entry logged before ingredient breakdowns shipped — that case looks exactly as before.
  const [ingredients, setIngredients] = useState<DraftIngredient[] | null>(() => toDraftIngredients(entry))

  const updateEntry = useUpdateFoodEntry()
  const deleteEntry = useDeleteFoodEntry()
  const saveEntries = useSaveFoodEntries()
  const { showToast } = useToast()

  // Session-local, same reasoning as ReviewStep: favoriting returns a new favorite id, not a
  // link back to this entry, so there's no way to ask the server "is this already a favorite".
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const totals = ingredients ? computeDishTotals(ingredients) : computeTotals(entry, grams)
  const error = updateEntry.error ?? deleteEntry.error

  const handleToggleFavorite = async () => {
    if (favoriteId) {
      await removeFavorite.mutateAsync(favoriteId)
      setFavoriteId(null)
    } else {
      const created = await addFavorite.mutateAsync({ entryId: entry.id })
      setFavoriteId(created.id)
    }
  }

  /** Scales every stored ingredient's grams by the same ratio as the dish's own — per-100g values
   *  are invariant under uniform scaling, so only the grams themselves need to move. */
  const handleGramsChange = (newGrams: number) => {
    setIngredients((current) => {
      if (!current || grams <= 0) return current
      const ratio = newGrams / grams
      return current.map((ingredient) => ({ ...ingredient, grams: round1(ingredient.grams * ratio) }))
    })
    setGrams(newGrams)
  }

  /** The breakdown itself changed: the dish's own grams follows the new sum, same rule the server
   *  applies once this reaches the PATCH (see FoodEntryService#applyIngredientEdit). */
  const handleIngredientGramsChange = (key: string, ingredientGrams: number) => {
    setIngredients((current) => {
      if (!current) return current
      const next = current.map((ingredient) => (ingredient.key === key ? { ...ingredient, grams: ingredientGrams } : ingredient))
      setGrams(sumGrams(next))
      return next
    })
  }

  const handleRemoveIngredient = (key: string) => {
    setIngredients((current) => {
      if (!current) return current
      const next = current.filter((ingredient) => ingredient.key !== key)
      setGrams(sumGrams(next))
      return next
    })
  }

  const handleSave = async () => {
    if (ingredients) {
      await updateEntry.mutateAsync({
        id: entry.id,
        grams,
        mealType,
        ingredients: ingredients.map((ingredient) => ({
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
    } else {
      await updateEntry.mutateAsync({ id: entry.id, grams, mealType })
    }
    onClose()
  }

  const handleDelete = async () => {
    await deleteEntry.mutateAsync(entry.id)
    onClose()
    showToast({
      message: 'Eliminado · Deshacer',
      actionLabel: 'Deshacer',
      onAction: async () => {
        await saveEntries.mutateAsync([entryToCreateRequest(entry)])
      },
    })
  }

  return (
    <Sheet onClose={onClose} ariaLabel={`Editar ${entry.name}`}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-lg font-bold text-ink capitalize">
          {entry.name} <SourceBadge source={entry.source} className="ml-1" />
        </p>
        <FavoriteStarButton
          favorited={Boolean(favoriteId)}
          onToggle={() => void handleToggleFavorite()}
          disabled={addFavorite.isPending || removeFavorite.isPending}
          className="-mt-1 -mr-1"
        />
      </div>
      <MacroChips kcal={totals.kcal} protein={totals.protein} fat={totals.fat} carbs={totals.carbs} className="mb-5" />

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-ink">Gramos</p>
        <GramsStepper value={grams} onChange={handleGramsChange} />
      </div>

      {ingredients && (
        <div className="mb-4">
          <IngredientsSection
            ingredients={ingredients}
            onChangeGrams={handleIngredientGramsChange}
            onRemove={handleRemoveIngredient}
          />
        </div>
      )}

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
    </Sheet>
  )
}
