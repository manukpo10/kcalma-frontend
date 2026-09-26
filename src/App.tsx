import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/AppShell'
import { LoadingScreen } from './components/LoadingScreen'
import { UpdatePrompt } from './components/UpdatePrompt'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { TodayPage } from './features/day/TodayPage'
import { AddMealPage } from './features/food/AddMealPage'
import { OnboardingPage } from './features/profile/OnboardingPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { RequireProfile } from './features/profile/RequireProfile'
import { SuggestMealsPage } from './features/suggestions/SuggestMealsPage'

// Recharts is sizeable — lazy-load the whole Progreso route so it never bloats the initial bundle.
const ProgressPage = lazy(() => import('./features/progress/ProgressPage').then((m) => ({ default: m.ProgressPage })))

export default function App() {
  return (
    <>
      {/* Outside every auth guard below so the update toast also works on /login. */}
      <UpdatePrompt />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/agregar"
          element={
            <RequireAuth>
              <RequireProfile>
                <AddMealPage />
              </RequireProfile>
            </RequireAuth>
          }
        />
        <Route
          element={
            <RequireAuth>
              <RequireProfile>
                <AppShell />
              </RequireProfile>
            </RequireAuth>
          }
        >
          <Route index element={<TodayPage />} />
          <Route
            path="progreso"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <ProgressPage />
              </Suspense>
            }
          />
          <Route path="sugerencias" element={<SuggestMealsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
