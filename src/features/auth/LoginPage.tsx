import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { TurnstileWidget } from '../../components/TurnstileWidget'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useToast } from '../../components/ui/ToastProvider'
import { env } from '../../lib/env'
import { supabase } from '../../lib/supabase'
import { AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'
import { isEmailNotConfirmedError, mapAuthError } from './authErrors'
import { loginSchema, type LoginFormValues } from './loginSchema'

export function LoginPage() {
  const { session, loading, isPasswordRecovery, redirectError, clearRedirectError } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [authError, setAuthError] = useState<string | null>(null)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resending, setResending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaAttempt, setCaptchaAttempt] = useState(0)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  // A password-recovery session must not bounce the user into the app before they change their
  // password — see AuthProvider's `isPasswordRecovery` doc comment.
  if (!loading && session && !isPasswordRecovery) {
    return <Navigate to="/" replace />
  }

  const resetCaptcha = () => {
    setCaptchaToken(null)
    setCaptchaAttempt((attempt) => attempt + 1)
  }

  const onSubmit = async (values: LoginFormValues) => {
    clearRedirectError()
    setAuthError(null)
    setEmailNotConfirmed(false)
    const { error } = await supabase.auth.signInWithPassword({
      ...values,
      options: { captchaToken: captchaToken ?? undefined },
    })
    resetCaptcha()
    if (error) {
      setAuthError(mapAuthError(error))
      setEmailNotConfirmed(isEmailNotConfirmedError(error))
      return
    }
    navigate('/', { replace: true })
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: getValues('email') })
      if (error) {
        setAuthError(mapAuthError(error))
        return
      }
      setEmailNotConfirmed(false)
      showToast({ message: 'Mail reenviado. Revisá tu bandeja.' })
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout heading="Kcalma" tagline="Come bien, llega a tu meta">
      {redirectError && (
        <Banner tone="danger" className="mb-4">
          {redirectError}
        </Banner>
      )}

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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {env.turnstileSiteKey && (
          <TurnstileWidget key={captchaAttempt} siteKey={env.turnstileSiteKey} onVerify={setCaptchaToken} />
        )}

        {authError && <Banner tone="danger">{authError}</Banner>}

        {emailNotConfirmed && (
          <Button variant="secondary" loading={resending} onClick={() => void handleResend()}>
            Reenviar mail de confirmación
          </Button>
        )}

        <Button type="submit" loading={isSubmitting} size="lg">
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/registro" className="font-semibold text-primary-400 hover:text-primary-300">
          Crear cuenta
        </Link>
        <Link to="/recuperar" className="font-semibold text-primary-400 hover:text-primary-300">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </AuthLayout>
  )
}
