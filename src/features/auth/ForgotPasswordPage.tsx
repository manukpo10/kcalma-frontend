import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { TurnstileWidget } from '../../components/TurnstileWidget'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { env } from '../../lib/env'
import { supabase } from '../../lib/supabase'
import { AuthLayout } from './AuthLayout'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './forgotPasswordSchema'

const NEUTRAL_MESSAGE =
  'Si existe una cuenta con ese correo, vas a recibir un mail con un enlace para restablecer tu contraseña.'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaAttempt, setCaptchaAttempt] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/restablecer`,
        captchaToken: captchaToken ?? undefined,
      })
    } catch {
      // Deliberately ignored — Supabase itself never reveals whether the address exists, and the
      // same neutral message is shown either way so this screen can't be used to check either.
    } finally {
      setCaptchaToken(null)
      setCaptchaAttempt((attempt) => attempt + 1)
      setSent(true)
    }
  }

  return (
    <AuthLayout heading="Recuperar contraseña de Kcalma" tagline="Recuperá el acceso a tu cuenta">
      {sent ? (
        <Banner tone="success">{NEUTRAL_MESSAGE}</Banner>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Correo electrónico"
            id="email"
            type="email"
            autoComplete="email"
            leadingIcon={<Mail className="size-5" aria-hidden="true" />}
            error={errors.email?.message}
            {...register('email')}
          />

          {env.turnstileSiteKey && (
            <TurnstileWidget key={captchaAttempt} siteKey={env.turnstileSiteKey} onVerify={setCaptchaToken} />
          )}

          <Button type="submit" loading={isSubmitting} size="lg">
            {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>
      )}

      <Link
        to="/login"
        className="mt-6 block text-center text-sm font-semibold text-primary-400 hover:text-primary-300"
      >
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
