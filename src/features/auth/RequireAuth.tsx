import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useAuth } from './AuthProvider'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading, isPasswordRecovery } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  // A password-recovery session only unlocks /restablecer, never the rest of the app — see
  // AuthProvider's `isPasswordRecovery` doc comment.
  if (!session || isPasswordRecovery) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
