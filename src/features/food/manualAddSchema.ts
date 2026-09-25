import { z } from 'zod'

// Numeric fields stay strings here (native <input> value type) and are converted to numbers on
// submit, same convention as onboardingSchema. Fiber/sugar/sodium are optional — default to 0 for
// a quick manual add when the user doesn't have those numbers handy.
function requiredNonNegative(message: string) {
  return z
    .string()
    .min(1, message)
    .refine((value) => Number(value) >= 0, { message: 'Debe ser 0 o mayor' })
}

function optionalNonNegative() {
  return z
    .string()
    .optional()
    .refine((value) => !value || Number(value) >= 0, { message: 'Debe ser 0 o mayor' })
}

export const manualAddSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  grams: z
    .string()
    .min(1, 'Los gramos son obligatorios')
    .refine((value) => Number(value) > 0 && Number(value) <= 5000, { message: 'Debe estar entre 1 y 5000 g' }),
  kcalPer100: requiredNonNegative('Las calorías son obligatorias'),
  proteinPer100: requiredNonNegative('La proteína es obligatoria'),
  fatPer100: requiredNonNegative('Las grasas son obligatorias'),
  carbsPer100: requiredNonNegative('Los carbohidratos son obligatorios'),
  fiberPer100: optionalNonNegative(),
  sugarPer100: optionalNonNegative(),
  sodiumMgPer100: optionalNonNegative(),
})

export type ManualAddFormValues = z.infer<typeof manualAddSchema>
