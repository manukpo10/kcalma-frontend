import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { onboardingSchema, type OnboardingFormValues } from './onboardingSchema'
import { useProfile, useUpdateProfile } from './useProfile'

const ACTIVITY_LEVELS: { value: OnboardingFormValues['activityLevel']; label: string }[] = [
  { value: 'SEDENTARY', label: 'Sedentary (little or no exercise)' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly active (1-3 days/week)' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active (3-5 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very active (6-7 days/week)' },
  { value: 'EXTRA_ACTIVE', label: 'Extra active (physical job or training twice a day)' },
]

const GOALS: { value: OnboardingFormValues['goal']; label: string }[] = [
  { value: 'LOSE', label: 'Lose weight' },
  { value: 'MAINTAIN', label: 'Maintain weight' },
  { value: 'GAIN', label: 'Gain weight' },
]

const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600'
const buttonClass =
  'w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition hover:bg-green-700 disabled:opacity-60'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { data: existing } = useProfile()
  const updateProfile = useUpdateProfile()

  const {
    register,
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
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-dvh px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-sm py-8">
        <h1 className="mb-6 text-2xl font-bold text-green-700">
          {existing ? 'Edit profile' : 'Tell us about yourself'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Sex" error={errors.sex?.message}>
            <select className={inputClass} {...register('sex')}>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
            </select>
          </Field>

          <Field label="Birth date" error={errors.birthDate?.message}>
            <input type="date" className={inputClass} {...register('birthDate')} />
          </Field>

          <Field label="Height (cm)" error={errors.heightCm?.message}>
            <input
              type="number"
              inputMode="numeric"
              className={inputClass}
              {...register('heightCm')}
            />
          </Field>

          <Field label="Weight (kg)" error={errors.weightKg?.message}>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              className={inputClass}
              {...register('weightKg')}
            />
          </Field>

          <Field label="Activity level" error={errors.activityLevel?.message}>
            <select className={inputClass} {...register('activityLevel')}>
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Goal" error={errors.goal?.message}>
            <select className={inputClass} {...register('goal')}>
              {GOALS.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </Field>

          {updateProfile.isError && (
            <p className="text-sm text-red-600">{updateProfile.error.message}</p>
          )}

          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
