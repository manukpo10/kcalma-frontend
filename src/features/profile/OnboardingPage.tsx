import { zodResolver } from '@hookform/resolvers/zod'
import {
  Activity,
  Cake,
  Droplet,
  Drumstick,
  Dumbbell,
  Flag,
  Flame,
  Gauge,
  Leaf,
  Minus,
  Moon,
  Percent,
  RefreshCw,
  Ruler,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Utensils,
  Wheat,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Screen } from '../../components/ui/Screen'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { SelectableCard } from '../../components/ui/SelectableCard'
import { cn } from '../../lib/cn'
import { todayIso } from '../../lib/date'
import { formatSignedWeight } from '../../lib/format'
import {
  ACTIVITY_LABELS,
  DIETARY_RESTRICTION_LABELS,
  DIET_STYLE_LABELS,
  GOAL_LABELS,
  PACE_LABELS,
  SEX_LABELS,
  needsPace,
  paceWeeklyRateKg,
} from './labels'
import { onboardingSchema, type OnboardingFormValues } from './onboardingSchema'
import { useProfile, useUpdateProfile } from './useProfile'

type GoalValue = OnboardingFormValues['goal']
type PaceValue = NonNullable<OnboardingFormValues['pace']>
type DietStyleValue = OnboardingFormValues['dietStyle']
type DietaryRestrictionValue = OnboardingFormValues['dietaryRestrictions'][number]

const SEX_OPTIONS: { value: OnboardingFormValues['sex']; label: string }[] = [
  { value: 'FEMALE', label: SEX_LABELS.FEMALE },
  { value: 'MALE', label: SEX_LABELS.MALE },
]

const ACTIVITY_ICONS: Record<OnboardingFormValues['activityLevel'], LucideIcon> = {
  SEDENTARY: Moon,
  LIGHTLY_ACTIVE: Wind,
  MODERATELY_ACTIVE: Activity,
  VERY_ACTIVE: Flame,
  EXTRA_ACTIVE: Zap,
}

const ACTIVITY_LEVELS: {
  value: OnboardingFormValues['activityLevel']
  title: string
  description: string
  icon: LucideIcon
}[] = (Object.keys(ACTIVITY_LABELS) as OnboardingFormValues['activityLevel'][]).map((value) => ({
  value,
  title: ACTIVITY_LABELS[value].title,
  description: ACTIVITY_LABELS[value].description,
  icon: ACTIVITY_ICONS[value],
}))

const GOAL_ICONS: Record<GoalValue, LucideIcon> = {
  LOSE_FAT: Flame,
  LOSE_WEIGHT: TrendingDown,
  RECOMP: RefreshCw,
  MAINTAIN: Minus,
  BUILD_MUSCLE: Dumbbell,
  GAIN_WEIGHT: TrendingUp,
}

const GOALS: { value: GoalValue; title: string; description?: string; icon: LucideIcon }[] = (
  Object.keys(GOAL_LABELS) as GoalValue[]
).map((value) => ({
  value,
  title: GOAL_LABELS[value].title,
  description: GOAL_LABELS[value].description,
  icon: GOAL_ICONS[value],
}))

const PACE_OPTIONS: PaceValue[] = ['SLOW', 'MODERATE', 'FAST']

const STRENGTH_OPTIONS: { value: OnboardingFormValues['strengthTraining']; label: string }[] = [
  { value: 'YES', label: 'Sí' },
  { value: 'NO', label: 'No' },
]

const DIET_STYLE_ICONS: Record<DietStyleValue, LucideIcon> = {
  BALANCED: Utensils,
  HIGH_PROTEIN: Drumstick,
  LOW_CARB: Wheat,
  KETO: Droplet,
}

const DIET_STYLES: { value: DietStyleValue; title: string; description: string; icon: LucideIcon }[] = (
  Object.keys(DIET_STYLE_LABELS) as DietStyleValue[]
).map((value) => ({
  value,
  title: DIET_STYLE_LABELS[value].title,
  description: DIET_STYLE_LABELS[value].description,
  icon: DIET_STYLE_ICONS[value],
}))

const DIETARY_RESTRICTIONS: { value: DietaryRestrictionValue; label: string }[] = (
  Object.keys(DIETARY_RESTRICTION_LABELS) as DietaryRestrictionValue[]
).map((value) => ({ value, label: DIETARY_RESTRICTION_LABELS[value] }))

const ALL_STEPS: { field: keyof OnboardingFormValues; question: string; icon: LucideIcon }[] = [
  { field: 'sex', question: 'Sexo', icon: Users },
  { field: 'birthDate', question: 'Fecha de nacimiento', icon: Cake },
  { field: 'heightCm', question: 'Altura', icon: Ruler },
  { field: 'weightKg', question: 'Peso', icon: Scale },
  { field: 'activityLevel', question: 'Nivel de actividad', icon: Activity },
  { field: 'goal', question: 'Objetivo', icon: Target },
  { field: 'pace', question: 'Ritmo', icon: Gauge },
  { field: 'goalWeightKg', question: 'Peso objetivo', icon: Flag },
  { field: 'strengthTraining', question: '¿Entrenamiento de fuerza?', icon: Dumbbell },
  { field: 'dietStyle', question: 'Estilo de alimentación', icon: Utensils },
  { field: 'dietaryRestrictions', question: 'Restricciones', icon: Leaf },
  { field: 'bodyFatPct', question: '% de grasa corporal', icon: Percent },
]

/** Steps whose validation spans more than their own field. */
const STEP_VALIDATION_FIELDS: Partial<Record<keyof OnboardingFormValues, (keyof OnboardingFormValues)[]>> = {
  bodyFatPct: ['bodyFatPct', 'bodyFatMeasuredOn'],
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { data: existing } = useProfile()
  const updateProfile = useUpdateProfile()
  const [step, setStep] = useState(0)

  const {
    register,
    watch,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      sex: 'FEMALE',
      birthDate: '',
      heightCm: '',
      weightKg: '',
      activityLevel: 'SEDENTARY',
      goal: 'MAINTAIN',
      pace: null,
      goalWeightKg: '',
      strengthTraining: 'NO',
      dietStyle: 'BALANCED',
      dietaryRestrictions: [],
      bodyFatPct: '',
      bodyFatMeasuredOn: todayIso(),
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        sex: existing.profile.sex,
        birthDate: existing.profile.birthDate,
        heightCm: String(existing.profile.heightCm),
        weightKg: String(existing.profile.weightKg),
        activityLevel: existing.profile.activityLevel,
        goal: existing.profile.goal,
        pace: existing.profile.pace,
        goalWeightKg: existing.profile.goalWeightKg !== null ? String(existing.profile.goalWeightKg) : '',
        strengthTraining: existing.profile.strengthTraining ? 'YES' : 'NO',
        dietStyle: existing.profile.dietStyle,
        dietaryRestrictions: existing.profile.dietaryRestrictions,
        bodyFatPct: existing.profile.bodyFatPct !== null ? String(existing.profile.bodyFatPct) : '',
        bodyFatMeasuredOn: existing.profile.bodyFatMeasuredOn ?? todayIso(),
      })
    }
  }, [existing, reset])

  const goal = watch('goal')
  // Recomposición/Mantener have no ramp — the wizard skips the Ritmo step for them.
  const steps = useMemo(() => ALL_STEPS.filter((item) => item.field !== 'pace' || needsPace(goal)), [goal])

  const onSubmit = async (values: OnboardingFormValues) => {
    await updateProfile.mutateAsync({
      sex: values.sex,
      birthDate: values.birthDate,
      heightCm: Number(values.heightCm),
      weightKg: Number(values.weightKg),
      activityLevel: values.activityLevel,
      goal: values.goal,
      pace: needsPace(values.goal) ? values.pace : null,
      dietStyle: values.dietStyle,
      dietaryRestrictions: values.dietaryRestrictions,
      strengthTraining: values.strengthTraining === 'YES',
      bodyFatPct: values.bodyFatPct ? Number(values.bodyFatPct) : null,
      bodyFatMeasuredOn: values.bodyFatPct ? values.bodyFatMeasuredOn : null,
      goalWeightKg: values.goalWeightKg ? Number(values.goalWeightKg) : null,
    })
    navigate('/', { replace: true })
  }

  const isLastStep = step === steps.length - 1

  const handleNext = async () => {
    const fieldsToValidate = STEP_VALIDATION_FIELDS[steps[step].field] ?? steps[step].field
    const valid = await trigger(fieldsToValidate)
    if (!valid) return

    if (!isLastStep) {
      setStep((current) => current + 1)
      return
    }

    await handleSubmit(onSubmit)()
  }

  const handleSkipBodyFat = async () => {
    setValue('bodyFatPct', '', { shouldValidate: true })
    await handleSubmit(onSubmit)()
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((current) => current - 1)
      return
    }
    if (existing) {
      navigate('/')
    }
  }

  const current = steps[step]
  const StepIcon = current.icon
  const currentWeightKg = Number(watch('weightKg')) || 0
  const restrictions = watch('dietaryRestrictions')

  return (
    <Screen
      title={existing ? 'Editar perfil' : 'Información personal'}
      onBack={step > 0 || existing ? handleBack : undefined}
    >
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Paso {step + 1} de {steps.length}
        </p>
        <ProgressBar value={step + 1} max={steps.length} aria-label="Progreso" />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleNext()
        }}
        noValidate
      >
        <div key={step} className="animate-step-in">
          <div className="mb-7 flex flex-col items-center text-center">
            <span className="mb-3 flex size-14 items-center justify-center rounded-full bg-teal-tint text-teal-300">
              <StepIcon className="size-7" aria-hidden="true" strokeWidth={2} />
            </span>
            <h2 className="text-xl font-bold text-ink">{current.question}</h2>
          </div>

          {current.field === 'sex' && (
            <SegmentedControl
              options={SEX_OPTIONS}
              value={watch('sex')}
              onChange={(value) => setValue('sex', value, { shouldValidate: true })}
              aria-label="Sexo"
            />
          )}

          {current.field === 'birthDate' && (
            <Input
              label="Fecha de nacimiento"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />
          )}

          {current.field === 'heightCm' && (
            <Input
              label="Altura"
              type="text"
              inputMode="decimal"
              placeholder="170"
              trailing={<span className="text-sm font-medium text-ink-muted">cm</span>}
              error={errors.heightCm?.message}
              {...register('heightCm')}
            />
          )}

          {current.field === 'weightKg' && (
            <Input
              label="Peso"
              type="text"
              inputMode="decimal"
              placeholder="65"
              trailing={<span className="text-sm font-medium text-ink-muted">kg</span>}
              error={errors.weightKg?.message}
              {...register('weightKg')}
            />
          )}

          {current.field === 'activityLevel' && (
            <div role="radiogroup" aria-label="Nivel de actividad" className="space-y-2.5">
              {ACTIVITY_LEVELS.map((level) => (
                <SelectableCard
                  key={level.value}
                  name="activityLevel"
                  selected={watch('activityLevel') === level.value}
                  onSelect={() => setValue('activityLevel', level.value, { shouldValidate: true })}
                  title={level.title}
                  description={level.description}
                  icon={<level.icon className="size-5" aria-hidden="true" />}
                />
              ))}
            </div>
          )}

          {current.field === 'goal' && (
            <div role="radiogroup" aria-label="Objetivo" className="space-y-2.5">
              {GOALS.map((option) => (
                <SelectableCard
                  key={option.value}
                  name="goal"
                  selected={watch('goal') === option.value}
                  onSelect={() => setValue('goal', option.value, { shouldValidate: true })}
                  title={option.title}
                  description={option.description}
                  icon={<option.icon className="size-5" aria-hidden="true" />}
                />
              ))}
            </div>
          )}

          {current.field === 'pace' && (
            <div role="radiogroup" aria-label="Ritmo" className="space-y-2.5">
              {PACE_OPTIONS.map((pace) => (
                <SelectableCard
                  key={pace}
                  name="pace"
                  selected={watch('pace') === pace}
                  onSelect={() => setValue('pace', pace, { shouldValidate: true })}
                  title={PACE_LABELS[pace]}
                  description={`${formatSignedWeight(paceWeeklyRateKg(goal, pace, currentWeightKg))} kg/semana`}
                />
              ))}
              {errors.pace && (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {errors.pace.message}
                </p>
              )}
            </div>
          )}

          {current.field === 'goalWeightKg' && (
            <Input
              label="Peso objetivo"
              type="text"
              inputMode="decimal"
              placeholder="Opcional"
              hint="Podés dejarlo en blanco y definirlo más adelante desde Progreso."
              trailing={<span className="text-sm font-medium text-ink-muted">kg</span>}
              error={errors.goalWeightKg?.message}
              {...register('goalWeightKg')}
            />
          )}

          {current.field === 'strengthTraining' && (
            <SegmentedControl
              options={STRENGTH_OPTIONS}
              value={watch('strengthTraining')}
              onChange={(value) => setValue('strengthTraining', value, { shouldValidate: true })}
              aria-label="Entrenamiento de fuerza"
            />
          )}

          {current.field === 'dietStyle' && (
            <div role="radiogroup" aria-label="Estilo de alimentación" className="space-y-2.5">
              {DIET_STYLES.map((option) => (
                <SelectableCard
                  key={option.value}
                  name="dietStyle"
                  selected={watch('dietStyle') === option.value}
                  onSelect={() => setValue('dietStyle', option.value, { shouldValidate: true })}
                  title={option.title}
                  description={option.description}
                  icon={<option.icon className="size-5" aria-hidden="true" />}
                />
              ))}
            </div>
          )}

          {current.field === 'dietaryRestrictions' && (
            <div role="group" aria-label="Restricciones alimentarias" className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map((restriction) => {
                const selected = restrictions.includes(restriction.value)
                return (
                  <button
                    key={restriction.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setValue(
                        'dietaryRestrictions',
                        selected
                          ? restrictions.filter((value) => value !== restriction.value)
                          : [...restrictions, restriction.value],
                        { shouldValidate: true },
                      )
                    }
                    className={cn(
                      'flex h-11 items-center rounded-full border px-4 text-sm font-semibold',
                      'transition-colors duration-150 ease-out',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
                      selected
                        ? 'border-primary-500 bg-primary-tint text-primary-300'
                        : 'border-hairline bg-surface text-ink-muted hover:border-neutral-700',
                    )}
                  >
                    {restriction.label}
                  </button>
                )
              })}
            </div>
          )}

          {current.field === 'bodyFatPct' && (
            <>
              <Input
                label="% de grasa corporal"
                type="text"
                inputMode="decimal"
                placeholder="Opcional"
                hint="Si lo sabés: bioimpedancia o antropometría."
                trailing={<span className="text-sm font-medium text-ink-muted">%</span>}
                error={errors.bodyFatPct?.message}
                {...register('bodyFatPct')}
              />
              {watch('bodyFatPct') && (
                <Input
                  label="Fecha de la medición"
                  type="date"
                  max={todayIso()}
                  containerClassName="mt-4"
                  error={errors.bodyFatMeasuredOn?.message}
                  {...register('bodyFatMeasuredOn')}
                />
              )}
            </>
          )}
        </div>

        {updateProfile.isError && (
          <Banner tone="danger" className="mt-5">
            {updateProfile.error.message}
          </Banner>
        )}

        <Button type="submit" loading={isSubmitting} size="lg" className="mt-8">
          {isLastStep ? (isSubmitting ? 'Guardando...' : 'Guardar') : 'Siguiente'}
        </Button>

        {current.field === 'bodyFatPct' && (
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => void handleSkipBodyFat()}
            className="mt-2"
          >
            Omitir
          </Button>
        )}
      </form>
    </Screen>
  )
}
