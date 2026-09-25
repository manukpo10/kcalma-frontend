import { Candy, ChevronLeft, ChevronRight, Drumstick, Droplet, Gauge, Leaf, Pencil, Wheat } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { BrandMark } from '../../components/ui/BrandMark'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { Screen } from '../../components/ui/Screen'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatTile } from '../../components/ui/StatTile'
import { TAB_BAR_CLEARANCE_CLASS } from '../../components/BottomTabBar'
import { addDays, formatDayLabel, todayIso } from '../../lib/date'
import { formatNumber } from '../../lib/format'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../food/labels'
import type { FoodEntry } from '../food/types'
import { EditEntryModal } from './EditEntryModal'
import { useDay } from './useDay'

export function TodayPage() {
  const [date, setDate] = useState(todayIso)
  const { data, isPending, error } = useDay(date)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)

  const isToday = date === todayIso()
  const allMealsEmpty = data ? MEAL_TYPE_ORDER.every((mealType) => (data.meals[mealType] ?? []).length === 0) : false

  return (
    <Screen title="Hoy" icon={<BrandMark size="sm" className="mr-1" />}>
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setDate((current) => addDays(current, -1))}
          aria-label="Día anterior"
          className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="text-base font-semibold text-ink">{formatDayLabel(date)}</p>
        <button
          type="button"
          onClick={() => setDate((current) => addDays(current, 1))}
          disabled={isToday}
          aria-label="Día siguiente"
          className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {error && <Banner tone="danger">{error instanceof Error ? error.message : 'Error al cargar el día.'}</Banner>}

      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-950 p-6 shadow-md">
            <p className="mb-4 text-center text-xs font-semibold tracking-wide text-teal-200 uppercase">
              Objetivo diario
            </p>
            <div className="flex justify-center">
              <ProgressRing
                value={data.consumed.kcal}
                max={data.targets.calories}
                size={188}
                color="var(--color-primary)"
                trackColor="rgb(255 255 255 / 0.14)"
                aria-label="Calorías consumidas"
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(Math.abs(data.remaining.kcal))}
                  </p>
                  <p className="text-xs text-teal-200">{data.remaining.kcal >= 0 ? 'kcal restantes' : 'kcal de más'}</p>
                </div>
              </ProgressRing>
            </div>
            <p className="mt-4 text-center text-sm text-teal-200">
              {formatNumber(data.consumed.kcal)} / {formatNumber(data.targets.calories)} kcal
            </p>
          </div>

          {data.exceeded.kcal && (
            <Banner tone="danger" className="mb-4">
              Superaste tu objetivo de calorías de {isToday ? 'hoy' : 'ese día'}.
            </Banner>
          )}
          {data.exceeded.sugar && (
            <Banner tone="danger" className="mb-4">
              Superaste el máximo de azúcar de {isToday ? 'hoy' : 'ese día'}.
            </Banner>
          )}
          {data.exceeded.sodium && (
            <Banner tone="danger" className="mb-4">
              Superaste el máximo de sodio de {isToday ? 'hoy' : 'ese día'}.
            </Banner>
          )}

          <div className="mb-4 grid grid-cols-3 gap-3">
            <StatTile
              icon={<Drumstick className="size-4" aria-hidden="true" />}
              label="Proteína"
              value={formatNumber(data.consumed.protein)}
              sublabel={`/ ${formatNumber(data.targets.proteinGrams)} g`}
              color="var(--color-protein)"
              tint="var(--color-protein-tint)"
              progress={(data.consumed.protein / data.targets.proteinGrams) * 100}
            />
            <StatTile
              icon={<Droplet className="size-4" aria-hidden="true" />}
              label="Grasas"
              value={formatNumber(data.consumed.fat)}
              sublabel={`/ ${formatNumber(data.targets.fatGrams)} g`}
              color="var(--color-fat)"
              tint="var(--color-fat-tint)"
              progress={(data.consumed.fat / data.targets.fatGrams) * 100}
            />
            <StatTile
              icon={<Wheat className="size-4" aria-hidden="true" />}
              label="Carbos"
              value={formatNumber(data.consumed.carbs)}
              sublabel={`/ ${formatNumber(data.targets.carbGrams)} g`}
              color="var(--color-carbs)"
              tint="var(--color-carbs-tint)"
              progress={(data.consumed.carbs / data.targets.carbGrams) * 100}
            />
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatTile
              icon={<Leaf className="size-4" aria-hidden="true" />}
              label="Fibra"
              value={formatNumber(data.consumed.fiber)}
              sublabel={`/ ${formatNumber(data.targets.fiberGrams)} g`}
              color="var(--color-success)"
              tint="var(--color-success-tint)"
              progress={(data.consumed.fiber / data.targets.fiberGrams) * 100}
            />
            <StatTile
              icon={<Candy className="size-4" aria-hidden="true" />}
              label="Azúcar (máx.)"
              value={formatNumber(data.consumed.sugar)}
              sublabel={`/ ${formatNumber(data.targets.sugarMaxGrams)} g`}
              color={data.exceeded.sugar ? 'var(--color-danger)' : 'var(--color-warning)'}
              tint={data.exceeded.sugar ? 'var(--color-danger-tint)' : 'var(--color-warning-tint)'}
              progress={(data.consumed.sugar / data.targets.sugarMaxGrams) * 100}
            />
            <StatTile
              icon={<Gauge className="size-4" aria-hidden="true" />}
              label="Sodio (máx.)"
              value={formatNumber(data.consumed.sodiumMg)}
              sublabel={`/ ${formatNumber(data.targets.sodiumMaxMg)} mg`}
              color={data.exceeded.sodium ? 'var(--color-danger)' : 'var(--color-warning)'}
              tint={data.exceeded.sodium ? 'var(--color-danger-tint)' : 'var(--color-warning-tint)'}
              progress={(data.consumed.sodiumMg / data.targets.sodiumMaxMg) * 100}
            />
          </div>

          <div className="space-y-5">
            {!allMealsEmpty && (
              <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                <Pencil className="size-3.5" aria-hidden="true" />
                Tocar una comida para editarla o eliminarla
              </p>
            )}
            {MEAL_TYPE_ORDER.map((mealType) => {
              const entries = data.meals[mealType] ?? []
              if (entries.length === 0) return null
              return (
                <div key={mealType}>
                  <p className="mb-2 text-sm font-semibold text-ink-muted">{MEAL_TYPE_LABELS[mealType]}</p>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setEditingEntry(entry)}
                        aria-label={`Editar ${entry.name}`}
                        className="flex w-full items-center justify-between rounded-xl bg-surface p-3.5 text-left shadow-xs transition-colors hover:bg-surface-2 active:bg-surface-2"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink capitalize">{entry.name}</span>
                          <span className="text-xs text-ink-muted">{formatNumber(entry.grams)} g</span>
                        </span>
                        <span className="ml-3 shrink-0 font-semibold text-ink">
                          {formatNumber(entry.totals.kcal)} kcal
                        </span>
                        <Pencil className="ml-3 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {allMealsEmpty && (
              <div className="rounded-xl bg-surface p-6 text-center">
                <p className="text-sm text-ink-muted">
                  Todavía no registraste comidas {isToday ? 'hoy' : 'ese día'}.
                </p>
              </div>
            )}
          </div>

          <div aria-hidden="true" className={TAB_BAR_CLEARANCE_CLASS} />
        </>
      )}

      {editingEntry && <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} />}
    </Screen>
  )
}
