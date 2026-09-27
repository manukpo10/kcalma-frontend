import { Candy, ChevronLeft, ChevronRight, Drumstick, Droplet, Gauge, Leaf, Pencil, Plus, Repeat2, Sparkles, Trash2, Wheat } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { BrandMark } from '../../components/ui/BrandMark'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { Screen } from '../../components/ui/Screen'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatTile } from '../../components/ui/StatTile'
import { useToast } from '../../components/ui/ToastProvider'
import { TAB_BAR_CLEARANCE_CLASS } from '../../components/BottomTabBar'
import { addDays, formatDayLabel, parseDateParam, todayIso } from '../../lib/date'
import { formatNumber } from '../../lib/format'
import { CheckinCard } from '../checkin/CheckinCard'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../food/labels'
import type { FoodEntry, MealType } from '../food/types'
import { useCopyMeal, useDeleteMeal } from '../food/useFoodEntries'
import { DeleteMealModal } from './DeleteMealModal'
import { EditEntryModal } from './EditEntryModal'
import { useDay } from './useDay'
import { WaterCard } from './WaterCard'

interface DeletingMeal {
  mealType: MealType
  entries: FoodEntry[]
}

/** Minimum gap between two visibility/focus-triggered checks — both events can fire together
 *  (e.g. returning from the native camera during add-meal) and this collapses that into one. */
const VISIBILITY_CHECK_MIN_INTERVAL_MS = 2000

export function TodayPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // Seeded from `?date=` so a link built while looking at a past day (a per-meal "agregar" CTA,
  // the tab bar's "+", or this same page reloaded) reopens on that day instead of snapping to today.
  const [date, setDate] = useState(() => parseDateParam(searchParams.get('date')))
  const { data, isPending, error, refetch } = useDay(date)

  /** Changes the viewed day AND keeps `?date=` in sync (`replace` — flipping days isn't a distinct
   *  history entry). Today collapses back to a bare `/` so the common case keeps a clean URL. */
  const updateDate = (nextDate: string) => {
    setDate(nextDate)
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (nextDate === todayIso()) {
          next.delete('date')
        } else {
          next.set('date', nextDate)
        }
        return next
      },
      { replace: true },
    )
  }

  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [deletingMeal, setDeletingMeal] = useState<DeletingMeal | null>(null)

  const isToday = date === todayIso()
  const allMealsEmpty = data ? MEAL_TYPE_ORDER.every((mealType) => (data.meals[mealType] ?? []).length === 0) : false

  // "Repetir {comida} de ayer": only meaningful while looking at today, so yesterday's day is
  // only fetched then — see useDay's `enabled` option.
  const yesterday = addDays(todayIso(), -1)
  const { data: yesterdayData } = useDay(yesterday, { enabled: isToday })
  const copyMeal = useCopyMeal()
  const deleteMeal = useDeleteMeal()
  const { showToast } = useToast()
  const [repeatError, setRepeatError] = useState<string | null>(null)

  const isMealRepeatable = (mealType: MealType) =>
    isToday &&
    Boolean(data) &&
    Boolean(yesterdayData) &&
    (data?.meals[mealType] ?? []).length === 0 &&
    (yesterdayData?.meals[mealType] ?? []).length > 0

  const handleRepeatMeal = async (mealType: MealType) => {
    setRepeatError(null)
    try {
      await copyMeal.mutateAsync({ fromDate: yesterday, toDate: date, mealType })
      showToast({
        message: `Repetiste ${MEAL_TYPE_LABELS[mealType].toLowerCase()} de ayer · Deshacer`,
        actionLabel: 'Deshacer',
        onAction: async () => {
          await deleteMeal.mutateAsync({ date, mealType })
        },
      })
    } catch (error) {
      setRepeatError(error instanceof Error ? error.message : 'No se pudo repetir la comida.')
    }
  }

  // iOS suspends an installed PWA in the background instead of reloading it, so without this,
  // "Hoy" can silently keep showing yesterday (or stale totals) for as long as the app stays
  // open — see the discovery this fixes: `date` used to be frozen at mount forever.
  const dateRef = useRef(date)
  const knownTodayRef = useRef(todayIso())
  const refetchRef = useRef(refetch)
  const updateDateRef = useRef(updateDate)
  const lastCheckRef = useRef(0)

  useEffect(() => {
    dateRef.current = date
  }, [date])

  useEffect(() => {
    refetchRef.current = refetch
  }, [refetch])

  useEffect(() => {
    updateDateRef.current = updateDate
  })

  useEffect(() => {
    const checkFreshness = () => {
      if (document.visibilityState !== 'visible') return

      const now = Date.now()
      if (now - lastCheckRef.current < VISIBILITY_CHECK_MIN_INTERVAL_MS) return
      lastCheckRef.current = now

      const currentToday = todayIso()
      const rolledOverPastMidnight = currentToday !== knownTodayRef.current
      const wasShowingToday = dateRef.current === knownTodayRef.current
      knownTodayRef.current = currentToday

      if (rolledOverPastMidnight && wasShowingToday) {
        // Follow "today" forward — changing the date itself triggers a fresh fetch for it.
        updateDateRef.current(currentToday)
        return
      }

      void refetchRef.current()
    }

    document.addEventListener('visibilitychange', checkFreshness)
    window.addEventListener('focus', checkFreshness)
    return () => {
      document.removeEventListener('visibilitychange', checkFreshness)
      window.removeEventListener('focus', checkFreshness)
    }
  }, [])

  return (
    <Screen title="Hoy" icon={<BrandMark size="sm" className="mr-1" />}>
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => updateDate(addDays(date, -1))}
          aria-label="Día anterior"
          className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="relative inline-flex">
          <p aria-hidden="true" className="flex h-11 items-center rounded-full px-3 text-base font-semibold text-ink">
            {formatDayLabel(date)}
          </p>
          <input
            type="date"
            value={date}
            max={todayIso()}
            onChange={(event) => updateDate(parseDateParam(event.target.value))}
            aria-label="Elegir otro día"
            className="absolute inset-0 h-11 w-full cursor-pointer opacity-0"
          />
        </div>
        <button
          type="button"
          onClick={() => updateDate(addDays(date, 1))}
          disabled={isToday}
          aria-label="Día siguiente"
          className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {isToday && <CheckinCard />}

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
            {isToday && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/sugerencias')}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors active:scale-[0.98] hover:bg-white/15 active:bg-white/20"
                >
                  <Sparkles className="size-4 text-primary-400" aria-hidden="true" />
                  ¿Qué como?
                </button>
              </div>
            )}
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

          {data.water && <WaterCard date={date} water={data.water} />}

          {repeatError && <Banner tone="danger" className="mb-4">{repeatError}</Banner>}

          <div className="space-y-5">
            {!allMealsEmpty && (
              <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                <Pencil className="size-3.5" aria-hidden="true" />
                Tocar una comida para editarla o eliminarla
              </p>
            )}
            {MEAL_TYPE_ORDER.map((mealType) => {
              const entries = data.meals[mealType] ?? []
              if (entries.length === 0) {
                if (isMealRepeatable(mealType)) {
                  return (
                    <button
                      key={mealType}
                      type="button"
                      onClick={() => void handleRepeatMeal(mealType)}
                      disabled={copyMeal.isPending}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-hairline text-sm font-semibold text-primary-300 transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Repeat2 className="size-4" aria-hidden="true" />
                      Repetir {MEAL_TYPE_LABELS[mealType].toLowerCase()} de ayer
                    </button>
                  )
                }
                // No entries yet and nothing to repeat (any other day, or today with no matching
                // meal logged yesterday): a direct, meal-scoped shortcut into the add flow — the
                // main gap this feature closes, since otherwise the only way in was the tab bar's
                // generic "+", always landing on today's meal-type guess.
                return (
                  <Link
                    key={mealType}
                    to={`/agregar?date=${date}&meal=${mealType}`}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-hairline text-sm font-semibold text-primary-300 transition-colors hover:bg-surface-2 active:bg-surface-2"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Agregar {MEAL_TYPE_LABELS[mealType].toLowerCase()}
                  </Link>
                )
              }
              return (
                <div key={mealType}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-muted">{MEAL_TYPE_LABELS[mealType]}</p>
                    <button
                      type="button"
                      onClick={() => setDeletingMeal({ mealType, entries })}
                      aria-label={`Eliminar ${MEAL_TYPE_LABELS[mealType]}`}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-danger active:bg-surface-2 active:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
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
                          <span className="block text-xs text-ink-muted">{formatNumber(entry.grams)} g</span>
                          {entry.ingredients && entry.ingredients.length > 1 && (
                            <span className="block text-[11px] text-ink-muted/60">{entry.ingredients.length} ingredientes</span>
                          )}
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
          </div>

          <div aria-hidden="true" className={TAB_BAR_CLEARANCE_CLASS} />
        </>
      )}

      {editingEntry && <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} />}
      {deletingMeal && (
        <DeleteMealModal
          date={date}
          mealType={deletingMeal.mealType}
          entries={deletingMeal.entries}
          onClose={() => setDeletingMeal(null)}
        />
      )}
    </Screen>
  )
}
