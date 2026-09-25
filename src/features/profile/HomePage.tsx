import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import { LoadingScreen } from '../../components/LoadingScreen'
import { useProfile } from './useProfile'

export function HomePage() {
  const { data, isPending, error } = useProfile()

  if (isPending) {
    return <LoadingScreen />
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center text-red-600">
        <p>{error instanceof Error ? error.message : 'Something went wrong loading your profile.'}</p>
      </div>
    )
  }

  const { targets } = data

  return (
    <div className="min-h-dvh bg-gray-50 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-sm py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-700">Kcalma</h1>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Log out
          </button>
        </header>

        <div className="mb-6 rounded-2xl bg-green-600 px-6 py-8 text-center text-white shadow-sm">
          <p className="text-sm tracking-wide text-green-100 uppercase">Daily target</p>
          <p className="text-5xl font-bold">{targets.calories}</p>
          <p className="text-sm text-green-100">kcal</p>
        </div>

        {targets.floorApplied && (
          <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your calculated target was below a safe minimum, so we raised it to a safe floor.
          </p>
        )}

        <div className="mb-6 grid grid-cols-3 gap-3">
          <Stat label="Protein" value={`${targets.proteinGrams} g`} />
          <Stat label="Fat" value={`${targets.fatGrams} g`} />
          <Stat label="Carbs" value={`${targets.carbGrams} g`} />
        </div>

        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <Row label="Fiber" value={`${targets.fiberGrams} g`} />
          <Row label="Free sugar (max)" value={`${targets.sugarMaxGrams} g`} />
          <Row label="Sodium (max)" value={`${targets.sodiumMaxMg} mg`} />
          <Row label="Water" value={`${targets.waterMl} ml`} />
        </div>

        <Link
          to="/onboarding"
          className="block w-full rounded-lg border border-green-600 py-3 text-center text-base font-semibold text-green-700 transition hover:bg-green-50"
        >
          Edit profile
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
