import { RefreshCw, Sparkles } from 'lucide-react'
import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Screen } from '../../components/ui/Screen'
import { Skeleton } from '../../components/ui/Skeleton'
import { todayIso } from '../../lib/date'
import { cn } from '../../lib/cn'
import type { AnalyzedItem, DraftItem, MealType } from '../food/types'
import { mealTypeForNow } from '../food/labels'
import { MealTypePicker } from '../food/MealTypePicker'
import { SuggestionOptionCard } from './SuggestionOptionCard'
import type { SuggestionOption, SuggestionResponse } from './types'
import { useSuggestMeals } from './useSuggestions'

const MAX_PREFERENCES_LENGTH = 300
const PREFERENCES_PLACEHOLDER = 'Ej: algo rápido, tengo pollo y arroz, sin carne'

type Step = 'form' | 'loading' | 'results'

function toDraftItems(items: AnalyzedItem[]): DraftItem[] {
  return items.map((item) => ({ key: crypto.randomUUID(), ...item, grams: Math.max(1, Math.round(item.grams)) }))
}

/**
 * "¿Qué como?": asks the backend for 3 meal options that fit what's left of today's budget for a
 * chosen meal type, then hands off to the EXISTING review step (via router state) so the user can
 * still edit grams before saving — the same save path used by the photo/text/manual add flows.
 */
export function SuggestMealsPage() {
  const navigate = useNavigate()
  const counterId = useId()

  const [step, setStep] = useState<Step>('form')
  const [mealType, setMealType] = useState<MealType>(() => mealTypeForNow())
  const [preferences, setPreferences] = useState('')
  const [result, setResult] = useState<SuggestionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const suggestMeals = useSuggestMeals()

  const runSuggest = async () => {
    setError(null)
    setStep('loading')
    try {
      const data = await suggestMeals.mutateAsync({
        date: todayIso(),
        mealType,
        preferences: preferences.trim() || undefined,
      })
      setResult(data)
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron generar sugerencias.')
      setStep('form')
    }
  }

  const handleRegister = (option: SuggestionOption) => {
    navigate('/agregar', { state: { prefill: { items: toDraftItems(option.items), mealType } } })
  }

  const handleBack = () => {
    if (step === 'form') {
      navigate('/')
      return
    }
    setStep('form')
  }

  return (
    <Screen title="¿Qué como?" onBack={step === 'loading' ? undefined : handleBack}>
      {step === 'form' && (
        <div className="space-y-5">
          {error && <Banner tone="danger">{error}</Banner>}

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Comida</p>
            <MealTypePicker value={mealType} onChange={setMealType} />
          </div>

          <div>
            <Input
              label="Preferencias (opcional)"
              placeholder={PREFERENCES_PLACEHOLDER}
              value={preferences}
              onChange={(event) => setPreferences(event.target.value.slice(0, MAX_PREFERENCES_LENGTH))}
              maxLength={MAX_PREFERENCES_LENGTH}
              aria-describedby={counterId}
            />
            <p
              id={counterId}
              className={cn(
                'mt-1.5 text-right text-xs',
                preferences.length >= MAX_PREFERENCES_LENGTH ? 'text-danger' : 'text-ink-muted',
              )}
            >
              {preferences.length}/{MAX_PREFERENCES_LENGTH}
            </p>
          </div>

          <Button size="lg" icon={<Sparkles className="size-5" aria-hidden="true" />} onClick={() => void runSuggest()}>
            Sugerir
          </Button>
        </div>
      )}

      {step === 'loading' && (
        <div className="space-y-5">
          <p className="text-center font-medium text-ink" role="status" aria-live="polite">
            Pensando opciones…
          </p>
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      )}

      {step === 'results' && result && (
        <div className="space-y-4">
          {result.note && <Banner tone="warning">{result.note}</Banner>}

          {result.options.length === 0 && !result.note && (
            <Banner tone="info">No encontramos opciones para esta combinación. Probá con otras preferencias.</Banner>
          )}

          <div className="space-y-3">
            {result.options.map((option, index) => (
              <SuggestionOptionCard
                key={`${index}-${option.title}`}
                option={option}
                onRegister={() => handleRegister(option)}
              />
            ))}
          </div>

          <Button
            variant="secondary"
            icon={<RefreshCw className="size-4" aria-hidden="true" />}
            loading={suggestMeals.isPending}
            onClick={() => void runSuggest()}
          >
            Otras opciones
          </Button>
        </div>
      )}
    </Screen>
  )
}
