import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import logoFullPng from '../../assets/brand/logo-full.png'
import logoFullWebp from '../../assets/brand/logo-full.webp'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import { useAuth } from './AuthProvider'
import { loginSchema, type LoginFormValues } from './loginSchema'

/** Maps known Supabase auth error strings to friendlier, actionable Spanish copy. */
function friendlyAuthError(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) {
    return 'El correo electrónico o la contraseña son incorrectos.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Es necesario confirmar el correo electrónico antes de iniciar sesión.'
  }
  if (normalized.includes('rate limit')) {
    return 'Demasiados intentos. Esperar un momento e intentar nuevamente.'
  }
  return message
}

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setAuthError(friendlyAuthError(error.message))
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-9 flex flex-col items-center text-center">
          <h1 className="sr-only">Kcalma</h1>
          <picture>
            <source srcSet={logoFullWebp} type="image/webp" />
            <img src={logoFullPng} alt="Kcalma" className="h-44 w-auto" />
          </picture>
          <p className="mt-1.5 text-sm text-ink-muted">Seguimiento de calorías simple y tranquilo.</p>
        </div>

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

          <Input
            label="Contraseña"
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            leadingIcon={<Lock className="size-5" aria-hidden="true" />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          {authError && <Banner tone="danger">{authError}</Banner>}

          <Button type="submit" loading={isSubmitting} size="lg">
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  )
}
