import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
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
import { useVerifyEmailLink } from './useVerifyEmailLink'
import { welcomeSchema, type WelcomeFormValues } from './welcomeSchema'

/** `/bienvenida` — reached from the invite email's `{{ .SiteURL }}/bienvenida?token_hash=...
 *  &type=invite` link. Public: token verification only ever runs from the "Aceptar invitación"
 *  tap, never on load (see useVerifyEmailLink), and the password-setup gate keeps RequireAuth from
 *  letting the person into the rest of the app until they've actually chosen a password. */
export function WelcomePage() {
  const [searchParams] = useSearchParams()
  const tokenHash = searchParams.get('token_hash')
  const { session, loading, requirePasswordSetup, completePasswordRecovery } = useAuth()
  const { status, verify } = useVerifyEmailLink(tokenHash, 'invite')
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WelcomeFormValues>({ resolver: zodResolver(welcomeSchema) })

  if (loading) {
    return <LoadingScreen />
  }

  const handleAccept = async () => {
    const verified = await verify()
    if (verified) {
      requirePasswordSetup()
    }
  }

  const onSubmit = async (values: WelcomeFormValues) => {
    setAuthError(null)
    const { error } = await supabase.auth.updateUser({ password: values.password })
    if (error) {
      setAuthError(mapAuthError(error))
      return
    }
    completePasswordRecovery()
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout heading="¡Listo!" tagline="Tu cuenta ya está activada">
        <Banner tone="success">
          ¡Listo! Ya podés usar Kcalma. Si estás en iPhone y usás la app instalada, abrila e iniciá
          sesión con tu correo y esta contraseña.
        </Banner>
        <Button size="lg" className="mt-6" onClick={() => navigate('/onboarding', { replace: true })}>
          Ir a la app
        </Button>
      </AuthLayout>
    )
  }

  if (session) {
    return (
      <AuthLayout heading="Elegí tu contraseña" tagline="Ya casi terminás">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <PasswordInput
            label="Contraseña"
            id="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            label="Confirmá tu contraseña"
            id="confirmPassword"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {authError && <Banner tone="danger">{authError}</Banner>}

          <Button type="submit" loading={isSubmitting} size="lg">
            {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      </AuthLayout>
    )
  }

  if (!tokenHash || status === 'error') {
    return (
      <AuthLayout heading="El enlace venció" tagline="Invitación a Kcalma">
        <Banner tone="danger">
          El link venció o ya se usó. Pedile una invitación nueva a quien administra Kcalma.
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
    <AuthLayout heading="Invitación a Kcalma" tagline="Te invitaron a Kcalma">
      <Button size="lg" loading={status === 'verifying'} onClick={() => void handleAccept()}>
        {status === 'verifying' ? 'Verificando...' : 'Aceptar invitación'}
      </Button>
    </AuthLayout>
  )
}
