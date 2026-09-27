import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  privacyAccepted: z.boolean().refine((value) => value === true, {
    message: 'Tenés que aceptar la política de privacidad',
  }),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>
