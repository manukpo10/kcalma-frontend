import { z } from 'zod'

// Number fields stay strings here (native <input> value type) and are converted
// to numbers on submit — avoids RHF/Zod input-vs-output generic friction.
export const onboardingSchema = z.object({
  sex: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  heightCm: z
    .string()
    .min(1, 'La altura es obligatoria')
    .refine((value) => Number(value) >= 50 && Number(value) <= 250, {
      message: 'La altura debe estar entre 50 y 250 cm',
    }),
  weightKg: z
    .string()
    .min(1, 'El peso es obligatorio')
    .refine((value) => Number(value) >= 20 && Number(value) <= 500, {
      message: 'El peso debe estar entre 20 y 500 kg',
    }),
  activityLevel: z.enum([
    'SEDENTARY',
    'LIGHTLY_ACTIVE',
    'MODERATELY_ACTIVE',
    'VERY_ACTIVE',
    'EXTRA_ACTIVE',
  ]),
  goal: z.enum(['LOSE', 'MAINTAIN', 'GAIN']),
  // Optional — left blank means "no goal weight set yet", validated only when provided.
  goalWeightKg: z
    .string()
    .refine((value) => !value || (Number(value) >= 30 && Number(value) <= 300), {
      message: 'El peso objetivo debe estar entre 30 y 300 kg',
    }),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
