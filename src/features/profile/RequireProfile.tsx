import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { LoadingScreen } from '../../components/LoadingScreen'
import { Banner } from '../../components/ui/Banner'
import { Screen } from '../../components/ui/Screen'
import { ApiNotFoundError } from '../../lib/api'
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
      <Screen contentClassName="flex items-center justify-center">
        <Banner tone="danger">
          {error instanceof Error ? error.message : 'Error al cargar el perfil.'}
        </Banner>
      </Screen>
    )
  }

  return <>{children}</>
}
