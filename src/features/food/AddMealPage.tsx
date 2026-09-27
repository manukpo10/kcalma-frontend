import { Camera, ImagePlus, LoaderCircle, PenLine } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Screen } from '../../components/ui/Screen'
import { Skeleton } from '../../components/ui/Skeleton'
import { todayIso } from '../../lib/date'
import { useDay } from '../day/useDay'
import { compressImage } from './compressImage'
import { DescribeMealStep } from './DescribeMealStep'
import { MEAL_TYPE_ORDER, mealTypeForNow } from './labels'
import { ManualAddStep } from './ManualAddStep'
import { analyzedDishToDraft, combineSources, computeDishTotals, per100FromTotals, round1, sumGrams, sumTotals } from './nutritionMath'
import { RecentFavoritesPicker } from './RecentFavoritesPicker'
import { ReviewStep, type DayPreview } from './ReviewStep'
import type { AnalyzedDish, DraftDish, FoodEntryRequest, MealType } from './types'
import { useAnalyzeDescription, useAnalyzePhoto, useSaveFoodEntries } from './useFoodEntries'

type Step = 'choose' | 'analyzing' | 'review' | 'manual' | 'describe'

const STEP_TITLES: Record<Step, string> = {
  choose: 'Agregar comida',
  analyzing: 'Analizando',
  review: 'Revisar comida',
  manual: 'Agregar manualmente',
  describe: 'Describir comida',
}

/** Router state carried from "¿Qué como?" (see SuggestMealsPage) so its "Registrar" CTA can drop
 *  the user straight into the review step below, prefilled with that option's dishes. */
interface SuggestionPrefill {
  dishes: DraftDish[]
  mealType: MealType
}

/** `/agregar?meal=ALMUERZO` — a reminder notification's deep link (see src/sw.ts's
 *  `notificationclick`) preselects that meal instead of whatever `mealTypeForNow()` would guess.
 *  `null` for anything missing/invalid, so a bad or absent query param just falls through to the
 *  existing time-of-day default. */
function parseMealTypeParam(value: string | null): MealType | null {
  return value && (MEAL_TYPE_ORDER as string[]).includes(value) ? (value as MealType) : null
}

export function AddMealPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const entryDate = todayIso()
  const { data: day } = useDay(entryDate)

  const prefill = (location.state as { prefill?: SuggestionPrefill } | null)?.prefill ?? null
  const deepLinkMealType = parseMealTypeParam(searchParams.get('meal'))
  // Stays the session's default meal type end to end (initial step, post-analysis, quick-pick
  // fallback) instead of only seeding the very first render — otherwise a slow photo analysis
  // that crosses an hour boundary would silently overwrite the meal the reminder was actually for.
  const defaultMealType = () => deepLinkMealType ?? mealTypeForNow()

  const [step, setStep] = useState<Step>(prefill ? 'review' : 'choose')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dishes, setDishes] = useState<DraftDish[]>(prefill?.dishes ?? [])
  const [mealType, setMealType] = useState<MealType>(() => prefill?.mealType ?? defaultMealType())
  const [note, setNote] = useState<string | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [analyzeKind, setAnalyzeKind] = useState<'photo' | 'text'>('photo')
  const [description, setDescription] = useState('')

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const analyzePhoto = useAnalyzePhoto()
  const analyzeDescription = useAnalyzeDescription()
  const saveEntries = useSaveFoodEntries()

  const resetToChoose = () => {
    setStep('choose')
    setAnalyzeError(null)
    setDescription('')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setAnalyzeError(null)
    setAnalyzeKind('photo')
    setStep('analyzing')
    try {
      const compressed = await compressImage(file)
      setPreviewUrl(URL.createObjectURL(compressed))
      const result = await analyzePhoto.mutateAsync(compressed)
      setDishes(result.dishes.map(analyzedDishToDraft))
      setNote(result.note)
      setMealType(defaultMealType())
      setStep('review')
    } catch (error) {
      setAnalyzeError(error instanceof Error ? error.message : 'No se pudo analizar la foto.')
      setStep('choose')
    }
  }

  const handleAnalyzeDescription = async () => {
    const trimmed = description.trim()
    if (!trimmed) return

    setAnalyzeError(null)
    setAnalyzeKind('text')
    setStep('analyzing')
    try {
      const result = await analyzeDescription.mutateAsync(trimmed)
      setDishes(result.dishes.map(analyzedDishToDraft))
      setNote(result.note)
      setMealType(defaultMealType())
      setDescription('')
      setStep('review')
    } catch (error) {
      setAnalyzeError(error instanceof Error ? error.message : 'No se pudo analizar la descripción.')
      setStep('describe')
    }
  }

  /** Scales every ingredient's grams by the same ratio as the dish's own — per-100g values are
   *  invariant under uniform scaling, so only the grams (and totals derived from them) change. */
  const handleChangeDishGrams = (dishKey: string, grams: number) => {
    setDishes((current) =>
      current.map((dish) => {
        if (dish.key !== dishKey) return dish
        const ratio = dish.grams > 0 ? grams / dish.grams : 1
        return {
          ...dish,
          grams,
          ingredients: dish.ingredients.map((ingredient) => ({ ...ingredient, grams: round1(ingredient.grams * ratio) })),
        }
      }),
    )
  }

  const handleRemoveDish = (dishKey: string) => {
    setDishes((current) => current.filter((dish) => dish.key !== dishKey))
  }

  /** The breakdown itself changed: the dish's own grams/source are re-derived FROM the ingredients
   *  (sum of grams, combined source) — same rule the backend applies on a PATCH ingredients edit. */
  const handleChangeIngredientGrams = (dishKey: string, ingredientKey: string, grams: number) => {
    setDishes((current) =>
      current.map((dish) => {
        if (dish.key !== dishKey) return dish
        const ingredients = dish.ingredients.map((ingredient) =>
          ingredient.key === ingredientKey ? { ...ingredient, grams } : ingredient,
        )
        return { ...dish, ingredients, grams: sumGrams(ingredients), source: combineSources(ingredients.map((i) => i.source)) }
      }),
    )
  }

  const handleRemoveIngredient = (dishKey: string, ingredientKey: string) => {
    setDishes((current) =>
      current.map((dish) => {
        if (dish.key !== dishKey) return dish
        const ingredients = dish.ingredients.filter((ingredient) => ingredient.key !== ingredientKey)
        return { ...dish, ingredients, grams: sumGrams(ingredients), source: combineSources(ingredients.map((i) => i.source)) }
      }),
    )
  }

  const handleSaveReview = async () => {
    const entries: FoodEntryRequest[] = dishes.map((dish) => {
      const totals = computeDishTotals(dish.ingredients)
      const per100 = per100FromTotals(totals, dish.grams)
      return {
        entryDate,
        mealType,
        name: dish.name,
        grams: dish.grams,
        ...per100,
        source: dish.source,
        fdcId: dish.fdcId,
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
      }
    })
    await saveEntries.mutateAsync(entries)
    navigate('/', { replace: true })
  }

  const handleSaveManual = async (entry: FoodEntryRequest) => {
    await saveEntries.mutateAsync([entry])
    navigate('/', { replace: true })
  }

  /** A dish was tapped in the Recientes/Favoritos picker — same destination as an analyzed photo:
   *  a single-dish review, grams still editable before saving. */
  const handleSelectQuickDish = (dish: AnalyzedDish, dishMealType: MealType | null) => {
    setDishes([analyzedDishToDraft(dish)])
    setNote(null)
    setMealType(dishMealType ?? defaultMealType())
    setStep('review')
  }

  const preview: DayPreview | null =
    day && dishes.length > 0
      ? (() => {
          const draftTotals = sumTotals(dishes.map((dish) => computeDishTotals(dish.ingredients)))
          return {
            newKcal: day.consumed.kcal + draftTotals.kcal,
            targetKcal: day.targets.calories,
            newSugar: day.consumed.sugar + draftTotals.sugar,
            sugarMax: day.targets.sugarMaxGrams,
            newSodium: day.consumed.sodiumMg + draftTotals.sodiumMg,
            sodiumMax: day.targets.sodiumMaxMg,
          }
        })()
      : null

  const handleBack = () => {
    if (step === 'choose') {
      navigate('/')
      return
    }
    resetToChoose()
  }

  return (
    <Screen title={STEP_TITLES[step]} onBack={step === 'analyzing' ? undefined : handleBack}>
      {step === 'choose' && (
        <div className="space-y-4">
          {analyzeError && <Banner tone="danger">{analyzeError}</Banner>}

          <Button size="lg" icon={<Camera className="size-5" aria-hidden="true" />} onClick={() => cameraInputRef.current?.click()}>
            Sacar foto
          </Button>
          <Button
            size="lg"
            variant="secondary"
            icon={<ImagePlus className="size-5" aria-hidden="true" />}
            onClick={() => galleryInputRef.current?.click()}
          >
            Elegir de la galería
          </Button>
          <Button
            size="lg"
            variant="secondary"
            icon={<PenLine className="size-5" aria-hidden="true" />}
            onClick={() => setStep('describe')}
          >
            Describir lo que comí
          </Button>
          <button
            type="button"
            onClick={() => setStep('manual')}
            className="block w-full text-center text-sm font-medium text-primary-300 underline-offset-2 hover:underline"
          >
            Agregar manualmente
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelected}
          />
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

          <RecentFavoritesPicker onSelectDish={handleSelectQuickDish} />
        </div>
      )}

      {step === 'analyzing' && (
        <div className="space-y-5">
          {analyzeKind === 'photo' && previewUrl && (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={previewUrl} alt="" className="h-48 w-full object-cover opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <LoaderCircle className="size-10 animate-spin text-primary-300" aria-hidden="true" />
              </div>
            </div>
          )}
          {analyzeKind === 'text' && (
            <div className="flex items-center justify-center rounded-2xl bg-surface-2 py-10">
              <LoaderCircle className="size-10 animate-spin text-primary-300" aria-hidden="true" />
            </div>
          )}
          <p className="text-center font-medium text-ink" role="status" aria-live="polite">
            {analyzeKind === 'text' ? 'Analizando tu descripción…' : 'Analizando tu plato...'}
          </p>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )}

      {step === 'describe' && (
        <DescribeMealStep
          value={description}
          onChange={setDescription}
          onAnalyze={() => void handleAnalyzeDescription()}
          error={analyzeError}
        />
      )}

      {step === 'review' && (
        <ReviewStep
          dishes={dishes}
          onChangeDishGrams={handleChangeDishGrams}
          onRemoveDish={handleRemoveDish}
          onChangeIngredientGrams={handleChangeIngredientGrams}
          onRemoveIngredient={handleRemoveIngredient}
          mealType={mealType}
          onMealTypeChange={setMealType}
          note={note}
          preview={preview}
          onSave={() => void handleSaveReview()}
          saving={saveEntries.isPending}
          saveError={saveEntries.error instanceof Error ? saveEntries.error.message : null}
        />
      )}

      {step === 'manual' && (
        <ManualAddStep
          entryDate={entryDate}
          onSubmit={(entry) => void handleSaveManual(entry)}
          saving={saveEntries.isPending}
          saveError={saveEntries.error instanceof Error ? saveEntries.error.message : null}
        />
      )}
    </Screen>
  )
}
