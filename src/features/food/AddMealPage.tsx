import { Camera, ImagePlus, LoaderCircle, PenLine } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Screen } from '../../components/ui/Screen'
import { Skeleton } from '../../components/ui/Skeleton'
import { todayIso } from '../../lib/date'
import { useDay } from '../day/useDay'
import { compressImage } from './compressImage'
import { DescribeMealStep } from './DescribeMealStep'
import { mealTypeForNow } from './labels'
import { ManualAddStep } from './ManualAddStep'
import { computeTotals, sumTotals } from './nutritionMath'
import { ReviewStep, type DayPreview } from './ReviewStep'
import type { AnalyzedItem, DraftItem, FoodEntryRequest, MealType } from './types'
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
 *  the user straight into the review step below, prefilled with that option's items. */
interface SuggestionPrefill {
  items: DraftItem[]
  mealType: MealType
}

function analyzedToDraft(item: AnalyzedItem): DraftItem {
  return { key: crypto.randomUUID(), ...item, grams: Math.max(1, Math.round(item.grams)) }
}

export function AddMealPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const entryDate = todayIso()
  const { data: day } = useDay(entryDate)

  const prefill = (location.state as { prefill?: SuggestionPrefill } | null)?.prefill ?? null

  const [step, setStep] = useState<Step>(prefill ? 'review' : 'choose')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [items, setItems] = useState<DraftItem[]>(prefill?.items ?? [])
  const [mealType, setMealType] = useState<MealType>(() => prefill?.mealType ?? mealTypeForNow())
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
      setItems(result.items.map(analyzedToDraft))
      setNote(result.note)
      setMealType(mealTypeForNow())
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
      setItems(result.items.map(analyzedToDraft))
      setNote(result.note)
      setMealType(mealTypeForNow())
      setDescription('')
      setStep('review')
    } catch (error) {
      setAnalyzeError(error instanceof Error ? error.message : 'No se pudo analizar la descripción.')
      setStep('describe')
    }
  }

  const handleChangeItem = (key: string, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  const handleRemoveItem = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  const handleSaveReview = async () => {
    const entries: FoodEntryRequest[] = items.map((item) => ({
      entryDate,
      mealType,
      name: item.name,
      grams: item.grams,
      kcalPer100: item.kcalPer100,
      proteinPer100: item.proteinPer100,
      fatPer100: item.fatPer100,
      carbsPer100: item.carbsPer100,
      fiberPer100: item.fiberPer100,
      sugarPer100: item.sugarPer100,
      sodiumMgPer100: item.sodiumMgPer100,
      source: item.source,
      fdcId: item.fdcId,
    }))
    await saveEntries.mutateAsync(entries)
    navigate('/', { replace: true })
  }

  const handleSaveManual = async (entry: FoodEntryRequest) => {
    await saveEntries.mutateAsync([entry])
    navigate('/', { replace: true })
  }

  const preview: DayPreview | null =
    day && items.length > 0
      ? (() => {
          const draftTotals = sumTotals(items.map((item) => computeTotals(item, item.grams)))
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
          items={items}
          onChangeItem={handleChangeItem}
          onRemoveItem={handleRemoveItem}
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
