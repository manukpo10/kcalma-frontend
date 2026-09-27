import { z } from 'zod'

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
