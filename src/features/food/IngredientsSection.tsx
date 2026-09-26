import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { SourceBadge } from '../../components/ui/SourceBadge'
import { cn } from '../../lib/cn'
import { formatNumber } from '../../lib/format'
import { GramsStepper } from './GramsStepper'
import { computeTotals } from './nutritionMath'
import type { DraftIngredient } from './types'

interface IngredientsSectionProps {
  ingredients: DraftIngredient[]
  onChangeGrams: (key: string, grams: number) => void
  onRemove: (key: string) => void
}

/**
 * Collapsible "Ingredientes (N)" breakdown reused by both the review step (before saving) and
 * `EditEntryModal` (a saved entry): collapsed by default, a 44px toggle, and each ingredient's own
 * name/source/grams/kcal/remove — same shape, only the surrounding save action differs. A
 * single-ingredient dish (a simple food) has nothing to break down, so this renders nothing.
 */
export function IngredientsSection({ ingredients, onChangeGrams, onRemove }: IngredientsSectionProps) {
  const [open, setOpen] = useState(false)

  if (ingredients.length <= 1) {
    return null
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span>Ingredientes ({ingredients.length})</span>
        <ChevronDown className={cn('size-4 shrink-0 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
      </button>

      <div className={cn('grid transition-all duration-200 ease-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="space-y-2 pb-1">
            {ingredients.map((ingredient) => {
              const kcal = computeTotals(ingredient, ingredient.grams).kcal
              return (
                <div key={ingredient.key} className="space-y-2 rounded-lg bg-surface-2 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium text-ink capitalize">
                      {ingredient.name} <SourceBadge source={ingredient.source} className="ml-1" />
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(ingredient.key)}
                      aria-label={`Quitar ${ingredient.name}`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hairline hover:text-danger"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <GramsStepper value={ingredient.grams} step={5} onChange={(grams) => onChangeGrams(ingredient.key, grams)} />
                    <span className="shrink-0 text-sm font-semibold text-ink">{formatNumber(kcal)} kcal</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
