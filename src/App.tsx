import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { HomePage } from './features/profile/HomePage'
import { OnboardingPage } from './features/profile/OnboardingPage'
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
        path="/"
        element={
          <RequireAuth>
            <RequireProfile>
              <HomePage />
            </RequireProfile>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
