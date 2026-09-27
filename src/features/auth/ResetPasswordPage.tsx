import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { LoadingScreen } from '../../components/LoadingScreen'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { supabase } from '../../lib/supabase'
import { AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'
import { mapAuthError } from './authErrors'
import { resetPasswordSchema, type ResetPasswordFormValues } from './resetPasswordSchema'
import { useVerifyEmailLink } from './useVerifyEmailLink'

export function ResetPasswordPage() {
  const { session, loading, clearRedirectError, completePasswordRecovery } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenHash = searchParams.get('token_hash')
  const { status, verify } = useVerifyEmailLink(tokenHash, 'recovery')
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  // This page owns messaging for an expired/used link on its own (below) — don't let a stale
  // #error=... also surface later as a banner on a subsequent /login visit.
  useEffect(() => {
    clearRedirectError()
  }, [clearRedirectError])

  if (loading) {
    return <LoadingScreen />
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setAuthError(null)
    const { error } = await supabase.auth.updateUser({ password: values.password })
    if (error) {
      setAuthError(mapAuthError(error))
      return
    }
    completePasswordRecovery()
    navigate('/', { replace: true })
  }

  // A session present here was set up either by the classic recovery redirect (implicit hash flow
  // — see supabase.ts's detectSessionInUrl) or by tapping "Continuar" below, regardless of whether
  // the PASSWORD_RECOVERY event fired before this component mounted or after — checking `session`
  // directly (rather than `isPasswordRecovery`) covers every ordering.
  if (session) {
    return (
      <AuthLayout heading="Restablecer contraseña" tagline="Elegí tu nueva contraseña">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <PasswordInput
            label="Nueva contraseña"
            id="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />

          {authError && <Banner tone="danger">{authError}</Banner>}

          <Button type="submit" loading={isSubmitting} size="lg">
            {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      </AuthLayout>
    )
  }

  // The newer token_hash link (from the recovery email template) needs an explicit tap before
  // it's redeemed — see useVerifyEmailLink. It never auto-verifies on load, so a fresh visit with
  // a still-good token_hash lands here instead of the expired-link screen below.
  if (tokenHash && status !== 'error') {
    return (
      <AuthLayout heading="Restablecer contraseña" tagline="Confirmá para continuar">
        <Button size="lg" loading={status === 'verifying'} onClick={() => void verify()}>
          {status === 'verifying' ? 'Verificando...' : 'Continuar'}
        </Button>
      </AuthLayout>
    )
  }

  // No session and no usable token_hash: the recovery link was invalid, expired, already used, or
  // its verification just failed above.
  return (
    <AuthLayout heading="El enlace venció" tagline="Restablecer contraseña">
      <Banner tone="danger">El link venció o ya se usó.</Banner>
      <Link
        to="/recuperar"
        className="mt-6 block text-center text-sm font-semibold text-primary-400 hover:text-primary-300"
      >
        Pedir un enlace nuevo
      </Link>
    </AuthLayout>
  )
}
