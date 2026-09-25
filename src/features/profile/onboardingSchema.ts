import { z } from 'zod'

// Number fields stay strings here (native <input> value type) and are converted
// to numbers on submit — avoids RHF/Zod input-vs-output generic friction.
export const onboardingSchema = z.object({
  sex: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().min(1, 'Birth date is required'),
  heightCm: z
    .string()
    .min(1, 'Height is required')
    .refine((value) => Number(value) >= 50 && Number(value) <= 250, {
      message: 'Enter a height between 50 and 250 cm',
    }),
  weightKg: z
    .string()
    .min(1, 'Weight is required')
    .refine((value) => Number(value) >= 20 && Number(value) <= 500, {
      message: 'Enter a weight between 20 and 500 kg',
    }),
  activityLevel: z.enum([
    'SEDENTARY',
    'LIGHTLY_ACTIVE',
    'MODERATELY_ACTIVE',
    'VERY_ACTIVE',
    'EXTRA_ACTIVE',
  ]),
  goal: z.enum(['LOSE', 'MAINTAIN', 'GAIN']),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
