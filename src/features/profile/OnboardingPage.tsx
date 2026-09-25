import { zodResolver } from '@hookform/resolvers/zod'
import {
  Activity,
  Cake,
  Flag,
  Flame,
  Minus,
  Moon,
  Ruler,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Screen } from '../../components/ui/Screen'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { SelectableCard } from '../../components/ui/SelectableCard'
import { ACTIVITY_LABELS, GOAL_LABELS, SEX_LABELS } from './labels'
import { onboardingSchema, type OnboardingFormValues } from './onboardingSchema'
import { useProfile, useUpdateProfile } from './useProfile'


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

const GOALS: { value: OnboardingFormValues['goal']; label: string; icon: LucideIcon }[] = [
  { value: 'LOSE', label: GOAL_LABELS.LOSE, icon: TrendingDown },
  { value: 'MAINTAIN', label: GOAL_LABELS.MAINTAIN, icon: Minus },
  { value: 'GAIN', label: GOAL_LABELS.GAIN, icon: TrendingUp },
]

const STEPS: { field: keyof OnboardingFormValues; question: string; icon: LucideIcon }[] = [
  { field: 'sex', question: 'Sexo', icon: Users },
  { field: 'birthDate', question: 'Fecha de nacimiento', icon: Cake },
  { field: 'heightCm', question: 'Altura', icon: Ruler },
  { field: 'weightKg', question: 'Peso', icon: Scale },
  { field: 'activityLevel', question: 'Nivel de actividad', icon: Activity },
  { field: 'goal', question: 'Objetivo', icon: Target },
  { field: 'goalWeightKg', question: 'Peso objetivo', icon: Flag },
]

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
      goalWeightKg: '',
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
        goalWeightKg: existing.profile.goalWeightKg !== null ? String(existing.profile.goalWeightKg) : '',
      })
    }
  }, [existing, reset])

  const onSubmit = async (values: OnboardingFormValues) => {
    await updateProfile.mutateAsync({
      sex: values.sex,
      birthDate: values.birthDate,
      heightCm: Number(values.heightCm),
      weightKg: Number(values.weightKg),
      activityLevel: values.activityLevel,
      goal: values.goal,
      goalWeightKg: values.goalWeightKg ? Number(values.goalWeightKg) : null,
    })
    navigate('/', { replace: true })
  }

  const isLastStep = step === STEPS.length - 1

  const handleNext = async () => {
    const valid = await trigger(STEPS[step].field)
    if (!valid) return

    if (!isLastStep) {
      setStep((current) => current + 1)
      return
    }

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

  const current = STEPS[step]
  const StepIcon = current.icon

  return (
    <Screen
      title={existing ? 'Editar perfil' : 'Información personal'}
      onBack={step > 0 || existing ? handleBack : undefined}
    >
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Paso {step + 1} de {STEPS.length}
        </p>
        <ProgressBar value={step + 1} max={STEPS.length} aria-label="Progreso" />
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
            <SegmentedControl
              options={GOALS.map((goal) => ({
                value: goal.value,
                label: goal.label,
                icon: <goal.icon className="size-4" aria-hidden="true" />,
              }))}
              value={watch('goal')}
              onChange={(value) => setValue('goal', value, { shouldValidate: true })}
              aria-label="Objetivo"
            />
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
        </div>

        {updateProfile.isError && (
          <Banner tone="danger" className="mt-5">
            {updateProfile.error.message}
          </Banner>
        )}

        <Button type="submit" loading={isSubmitting} size="lg" className="mt-8">
          {isLastStep ? (isSubmitting ? 'Guardando...' : 'Guardar') : 'Siguiente'}
        </Button>
      </form>
    </Screen>
  )
}
