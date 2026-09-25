import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { ApiNotFoundError } from '../../lib/api'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useProfile } from './useProfile'

/** Logged in but no profile yet (404) -> onboarding. Any other error -> shown inline. */
export function RequireProfile({ children }: { children: ReactNode }) {
  const { data, error, isPending } = useProfile()

  if (isPending) {
    return <LoadingScreen />
  }

  if (error instanceof ApiNotFoundError) {
    return <Navigate to="/onboarding" replace />
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center text-red-600">
        <p>{error instanceof Error ? error.message : 'Something went wrong loading your profile.'}</p>
      </div>
    )
  }

  return <>{children}</>
}
