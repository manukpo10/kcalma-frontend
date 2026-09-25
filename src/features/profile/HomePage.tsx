import { Candy, Droplet, Droplets, Drumstick, Gauge, Leaf, LogOut, Pencil, Wheat } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { Screen } from '../../components/ui/Screen'
import { StatTile } from '../../components/ui/StatTile'
import { LoadingScreen } from '../../components/LoadingScreen'
import { formatNumber } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { ACTIVITY_LABELS, SEX_LABELS } from './labels'
import { useProfile } from './useProfile'

// Food log doesn't exist yet — consumed is always 0 for now, but the ring and
// tiles are already shaped as "consumed / target" so they're ready to wire up.
const CONSUMED = 0

export function HomePage() {
  const { data, isPending, error } = useProfile()

  if (isPending) {
    return <LoadingScreen />
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

  const { profile, targets } = data

  return (
    <Screen
      title="Kcalma"
      actions={
        <>
          <Link
            to="/onboarding"
            aria-label="Editar perfil"
            className="flex size-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Pencil className="size-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            aria-label="Cerrar sesión"
            className="flex size-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </>
      }
    >
      <p className="mb-5 text-sm text-ink-muted">
        {SEX_LABELS[profile.sex]} · {ACTIVITY_LABELS[profile.activityLevel].title}
      </p>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 shadow-md">
        <p className="mb-4 text-center text-xs font-semibold tracking-wide text-primary-100 uppercase">
          Objetivo diario
        </p>
        <div className="flex justify-center">
          <ProgressRing value={CONSUMED} max={targets.calories} size={188} aria-label="Calorías consumidas">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{formatNumber(CONSUMED)}</p>
              <p className="text-sm text-primary-100">/ {formatNumber(targets.calories)} kcal</p>
            </div>
          </ProgressRing>
        </div>
      </div>

      {targets.floorApplied && (
        <Banner tone="info" className="mb-6">
          El objetivo calculado estaba por debajo de un mínimo seguro, por lo que se ajustó a un piso
          seguro.
        </Banner>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile
          icon={<Drumstick className="size-4" aria-hidden="true" />}
          label="Proteína"
          value={formatNumber(CONSUMED)}
          sublabel={`/ ${formatNumber(targets.proteinGrams)} g`}
          color="var(--color-protein)"
          tint="var(--color-protein-tint)"
          progress={(CONSUMED / targets.proteinGrams) * 100}
        />
        <StatTile
          icon={<Droplet className="size-4" aria-hidden="true" />}
          label="Grasas"
          value={formatNumber(CONSUMED)}
          sublabel={`/ ${formatNumber(targets.fatGrams)} g`}
          color="var(--color-fat)"
          tint="var(--color-fat-tint)"
          progress={(CONSUMED / targets.fatGrams) * 100}
        />
        <StatTile
          icon={<Wheat className="size-4" aria-hidden="true" />}
          label="Carbos"
          value={formatNumber(CONSUMED)}
          sublabel={`/ ${formatNumber(targets.carbGrams)} g`}
          color="var(--color-carbs)"
          tint="var(--color-carbs-tint)"
          progress={(CONSUMED / targets.carbGrams) * 100}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={<Leaf className="size-4" aria-hidden="true" />}
          label="Fibra"
          value={formatNumber(targets.fiberGrams)}
          sublabel="g"
        />
        <StatTile
          icon={<Candy className="size-4" aria-hidden="true" />}
          label="Azúcar libre (máx.)"
          value={formatNumber(targets.sugarMaxGrams)}
          sublabel="g"
        />
        <StatTile
          icon={<Gauge className="size-4" aria-hidden="true" />}
          label="Sodio (máx.)"
          value={formatNumber(targets.sodiumMaxMg)}
          sublabel="mg"
        />
        <StatTile
          icon={<Droplets className="size-4" aria-hidden="true" />}
          label="Agua"
          value={formatNumber(targets.waterMl)}
          sublabel="ml"
        />
      </div>
    </Screen>
  )
}
