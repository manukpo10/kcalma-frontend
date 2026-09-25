import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from './AuthProvider'
import { loginSchema, type LoginFormValues } from './loginSchema'

const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600'

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)

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
      setAuthError(error.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-green-700">Kcalma</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {authError && <p className="text-sm text-red-600">{authError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}
