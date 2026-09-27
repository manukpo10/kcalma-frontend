import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/AppShell'
import { LoadingScreen } from './components/LoadingScreen'
import { OfflineBanner } from './components/OfflineBanner'
import { ServiceWorkerNavigationListener } from './components/ServiceWorkerNavigationListener'
import { UpdatePrompt } from './components/UpdatePrompt'
import { ToastProvider } from './components/ui/ToastProvider'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { TodayPage } from './features/day/TodayPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { RequireProfile } from './features/profile/RequireProfile'

// Every route below is reached behind at least one guard/redirect, never the very first paint —
// lazy-loading them keeps the initial bundle to just "Hoy" + auth/profile plumbing. The
// sign-up/recovery/privacy screens follow the same rule even though they're public: only someone
// who isn't logged in yet (or is resetting a password) ever hits them, never the first paint.
const ProgressPage = lazy(() => import('./features/progress/ProgressPage').then((m) => ({ default: m.ProgressPage })))
const AddMealPage = lazy(() => import('./features/food/AddMealPage').then((m) => ({ default: m.AddMealPage })))
const SuggestMealsPage = lazy(() =>
  import('./features/suggestions/SuggestMealsPage').then((m) => ({ default: m.SuggestMealsPage })),
)
const OnboardingPage = lazy(() =>
  import('./features/profile/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
)
const SignUpPage = lazy(() => import('./features/auth/SignUpPage').then((m) => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() =>
  import('./features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('./features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const PrivacyPage = lazy(() => import('./features/privacy/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))

export default function App() {
  return (
    <ToastProvider>
      {/* Outside every auth guard below so the update toast/offline banner also work on /login,
          and outside <Routes> entirely so the SW navigation bridge is active for every route,
          including /agregar (its own top-level <Route> further down). */}
      <UpdatePrompt />
      <OfflineBanner />
      <ServiceWorkerNavigationListener />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/registro"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <SignUpPage />
            </Suspense>
          }
        />
        <Route
          path="/recuperar"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/restablecer"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/privacidad"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PrivacyPage />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Suspense fallback={<LoadingScreen />}>
                <OnboardingPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path="/agregar"
          element={
            <RequireAuth>
              <RequireProfile>
                <Suspense fallback={<LoadingScreen />}>
                  <AddMealPage />
                </Suspense>
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
          <Route
            path="sugerencias"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <SuggestMealsPage />
              </Suspense>
            }
          />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
