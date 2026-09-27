import { ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { FavoriteStarButton } from '../../components/ui/FavoriteStarButton'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../components/ui/ToastProvider'
import { formatNumber } from '../../lib/format'
import { favoriteToCreateRequest } from './nutritionMath'
import type { AnalyzedDish, FavoriteDish, MealType, RecentDish } from './types'
import { useAddFavorite, useFavorites, useRemoveFavorite } from './useFavorites'
import { useRecentDishes } from './useRecentDishes'

interface RecentFavoritesPickerProps {
  /** A dish was tapped — `mealType` is that dish's own last/saved meal type, if it has one. */
  onSelectDish: (dish: AnalyzedDish, mealType: MealType | null) => void
}

/**
 * "Recientes" + "Favoritos" sections on the add-meal screen: a search box filters both by name,
 * tapping a dish hands it to the caller (which opens the existing review step prefilled).
 * Renders nothing until at least one of the two lists has something to show — a brand-new
 * account sees just the plain method buttons, no empty sections.
 */
export function RecentFavoritesPicker({ onSelectDish }: RecentFavoritesPickerProps) {
  const [query, setQuery] = useState('')
  const [editingFavorites, setEditingFavorites] = useState(false)

  const { data: recent } = useRecentDishes()
  const { data: favorites } = useFavorites()
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const { showToast } = useToast()

  const hasAnyData = (recent?.length ?? 0) > 0 || (favorites?.length ?? 0) > 0
  if (!hasAnyData) {
    return null
  }

  const normalizedQuery = query.trim().toLowerCase()
  const matches = (name: string) => name.toLowerCase().includes(normalizedQuery)
  const filteredRecent = (recent ?? []).filter((dish) => matches(dish.name))
  const filteredFavorites = (favorites ?? []).filter((dish) => matches(dish.name))
  const noResults = normalizedQuery.length > 0 && filteredRecent.length === 0 && filteredFavorites.length === 0

  const handleRemoveFavorite = async (favorite: FavoriteDish) => {
    await removeFavorite.mutateAsync(favorite.id)
    showToast({
      message: 'Quitado de favoritos · Deshacer',
      actionLabel: 'Deshacer',
      onAction: async () => {
        await addFavorite.mutateAsync(favoriteToCreateRequest(favorite))
      },
    })
  }

  return (
    <div className="space-y-5">
      <div aria-hidden="true" className="h-px bg-hairline" />

      <Input
        leadingIcon={<Search className="size-4" aria-hidden="true" />}
        placeholder="Buscar comida..."
        aria-label="Buscar en recientes y favoritos"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {noResults && <p className="text-sm text-ink-muted">Sin resultados para "{query.trim()}".</p>}

      {filteredRecent.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-muted">Recientes</p>
          <div className="space-y-2">
            {filteredRecent.map((dish) => (
              <DishRow key={`${dish.name}-${dish.lastLoggedOn}`} dish={dish} onSelect={() => onSelectDish(dish, dish.lastMealType)} />
            ))}
          </div>
        </div>
      )}

      {filteredFavorites.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-muted">Favoritos</p>
            <button
              type="button"
              onClick={() => setEditingFavorites((value) => !value)}
              className="h-11 px-2 text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200"
            >
              {editingFavorites ? 'Listo' : 'Editar'}
            </button>
          </div>
          <div className="space-y-2">
            {filteredFavorites.map((dish) =>
              editingFavorites ? (
                <div key={dish.id} className="flex w-full items-center gap-2 rounded-xl bg-surface p-3.5 shadow-xs">
                  <DishSummary dish={dish} />
                  <FavoriteStarButton
                    favorited
                    onToggle={() => void handleRemoveFavorite(dish)}
                    disabled={removeFavorite.isPending}
                    aria-label={`Quitar ${dish.name} de favoritos`}
                  />
                </div>
              ) : (
                <DishRow key={dish.id} dish={dish} onSelect={() => onSelectDish(dish, dish.mealType)} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DishSummary({ dish }: { dish: AnalyzedDish | RecentDish | FavoriteDish }) {
  return (
    <span className="min-w-0 flex-1 text-left">
      <span className="block truncate font-medium text-ink capitalize">{dish.name}</span>
      <span className="block text-xs text-ink-muted">
        {formatNumber(dish.grams)} g · {formatNumber(dish.totals.kcal)} kcal
      </span>
    </span>
  )
}

function DishRow({ dish, onSelect }: { dish: AnalyzedDish | RecentDish | FavoriteDish; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Elegir ${dish.name}`}
      className="flex w-full items-center gap-2 rounded-xl bg-surface p-3.5 text-left shadow-xs transition-colors hover:bg-surface-2 active:bg-surface-2"
    >
      <DishSummary dish={dish} />
      <ChevronRight className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
    </button>
  )
}
