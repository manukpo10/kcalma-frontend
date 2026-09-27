import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router'
import { TurnstileWidget } from '../../components/TurnstileWidget'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { env } from '../../lib/env'
import { supabase } from '../../lib/supabase'
import { AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'
import { mapAuthError } from './authErrors'
import { signUpSchema, type SignUpFormValues } from './signUpSchema'

export function SignUpPage() {
  const { session, loading, isPasswordRecovery } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaAttempt, setCaptchaAttempt] = useState(0)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', privacyAccepted: false },
  })

  if (!loading && session && !isPasswordRecovery) {
    return <Navigate to="/" replace />
  }

  // Kcalma runs by invitation — public registration is closed unless VITE_SIGNUPS_ENABLED=true.
  if (!env.signupsEnabled) {
    return (
      <AuthLayout heading="Registro cerrado" tagline="Kcalma funciona por invitación">
        <Banner tone="info">El registro está cerrado. Pedile una invitación a quien administra Kcalma.</Banner>
        <Link
          to="/login"
          className="mt-6 block text-center text-sm font-semibold text-primary-400 hover:text-primary-300"
        >
          Iniciar sesión
        </Link>
      </AuthLayout>
    )
  }

  const onSubmit = async (values: SignUpFormValues) => {
    setAuthError(null)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { privacy_accepted_at: new Date().toISOString() },
        captchaToken: captchaToken ?? undefined,
      },
    })
    setCaptchaToken(null)
    setCaptchaAttempt((attempt) => attempt + 1)

    if (error) {
      setAuthError(mapAuthError(error))
      return
    }
    // Same success screen whether this is a brand-new address or one that already has a
    // confirmed account: with email confirmations on, Supabase returns success either way (an
    // existing address comes back with an empty `identities` array, no error) specifically so a
    // sign-up attempt can never be used to check whether an email is registered.
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout heading="Revisá tu mail" tagline="Ya casi terminás">
        <Banner tone="success">
          Te enviamos un mail para confirmar tu cuenta. Si no lo ves en un par de minutos, fijate
          en spam. Si estás en iPhone, ese enlace se abre en Safari: una vez que confirmes ahí,
          volvé a abrir Kcalma e iniciá sesión con tu contraseña.
        </Banner>
        <Link
          to="/login"
          className="mt-6 block text-center text-sm font-semibold text-primary-400 hover:text-primary-300"
        >
          Volver a iniciar sesión
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout heading="Crear cuenta en Kcalma" tagline="Creá tu cuenta para empezar">
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

        <PasswordInput
          label="Contraseña"
          id="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Controller
          control={control}
          name="privacyAccepted"
          render={({ field }) => (
            <Checkbox
              id="privacyAccepted"
              checked={field.value}
              onChange={field.onChange}
              error={errors.privacyAccepted?.message}
              label={
                <>
                  Acepto la{' '}
                  <Link to="/privacidad" className="font-medium text-primary-400 underline hover:text-primary-300">
                    política de privacidad
                  </Link>
                </>
              }
            />
          )}
        />

        {env.turnstileSiteKey && (
          <TurnstileWidget key={captchaAttempt} siteKey={env.turnstileSiteKey} onVerify={setCaptchaToken} />
        )}

        {authError && <Banner tone="danger">{authError}</Banner>}

        <Button type="submit" loading={isSubmitting} size="lg">
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
