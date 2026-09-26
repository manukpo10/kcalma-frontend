import { Candy, Droplet, Droplets, Drumstick, Flame, Gauge, LogOut, Pencil, Wheat } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { BrandMark } from '../../components/ui/BrandMark'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Screen } from '../../components/ui/Screen'
import { StatTile } from '../../components/ui/StatTile'
import { TAB_BAR_CLEARANCE_CLASS } from '../../components/BottomTabBar'
import { LoadingScreen } from '../../components/LoadingScreen'
import { formatNumber } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { ACTIVITY_LABELS, SEX_LABELS } from './labels'
import { useProfile } from './useProfile'

/** Profile summary + daily targets (read-only reference) + edit profile + log out. */
export function ProfilePage() {
  const navigate = useNavigate()
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
    <Screen title="Perfil" icon={<BrandMark size="sm" className="mr-1" />}>
      <p className="mb-5 text-sm text-ink-muted">
        {SEX_LABELS[profile.sex]} · {ACTIVITY_LABELS[profile.activityLevel].title}
      </p>

      {targets.floorApplied && (
        <Banner tone="info" className="mb-5">
          El objetivo calculado estaba por debajo de un mínimo seguro, por lo que se ajustó a un piso
          seguro.
        </Banner>
      )}

      <Card className="mb-6">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          <Flame className="size-4" aria-hidden="true" />
          Objetivos diarios
        </p>
        <p className="mb-4 text-3xl font-bold text-ink">
          {formatNumber(targets.calories)} <span className="text-base font-medium text-ink-muted">kcal</span>
        </p>

        <div className="mb-3 grid grid-cols-3 gap-3">
          <StatTile
            icon={<Drumstick className="size-4" aria-hidden="true" />}
            label="Proteína"
            value={formatNumber(targets.proteinGrams)}
            sublabel="g"
            color="var(--color-protein)"
            tint="var(--color-protein-tint)"
          />
          <StatTile
            icon={<Droplet className="size-4" aria-hidden="true" />}
            label="Grasas"
            value={formatNumber(targets.fatGrams)}
            sublabel="g"
            color="var(--color-fat)"
            tint="var(--color-fat-tint)"
          />
          <StatTile
            icon={<Wheat className="size-4" aria-hidden="true" />}
            label="Carbos"
            value={formatNumber(targets.carbGrams)}
            sublabel="g"
            color="var(--color-carbs)"
            tint="var(--color-carbs-tint)"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            icon={<Candy className="size-4" aria-hidden="true" />}
            label="Azúcar (máx.)"
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
            color="var(--color-teal-400)"
            tint="var(--color-teal-tint)"
          />
        </div>
      </Card>

      <div className="space-y-3">
        <Button
          variant="secondary"
          icon={<Pencil className="size-5" aria-hidden="true" />}
          onClick={() => navigate('/onboarding')}
        >
          Editar perfil
        </Button>
        <Button
          variant="ghost"
          icon={<LogOut className="size-5" aria-hidden="true" />}
          onClick={() => void supabase.auth.signOut()}
        >
          Cerrar sesión
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-ink-muted">Datos nutricionales: USDA FoodData Central</p>

      <div aria-hidden="true" className={TAB_BAR_CLEARANCE_CLASS} />
    </Screen>
  )
}
