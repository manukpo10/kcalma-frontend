import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { TodayPage } from './features/day/TodayPage'
import { AddMealPage } from './features/food/AddMealPage'
import { OnboardingPage } from './features/profile/OnboardingPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { RequireProfile } from './features/profile/RequireProfile'

export default function App() {
  return (
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
        <Route path="perfil" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
