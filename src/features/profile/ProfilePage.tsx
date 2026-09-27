import { Candy, Download, Droplet, Droplets, Drumstick, Flame, Gauge, LogOut, Pencil, Target, Wheat } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Banner } from '../../components/ui/Banner'
import { BrandMark } from '../../components/ui/BrandMark'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Screen } from '../../components/ui/Screen'
import { StatTile } from '../../components/ui/StatTile'
import { TAB_BAR_CLEARANCE_CLASS } from '../../components/BottomTabBar'
import { LoadingScreen } from '../../components/LoadingScreen'
import { formatNumber, formatSignedWeight } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { ExportDataSheet } from './ExportDataSheet'
import {
  ACTIVITY_LABELS,
  DIETARY_RESTRICTION_LABELS,
  DIET_STYLE_LABELS,
  GOAL_LABELS,
  PACE_LABELS,
  SEX_LABELS,
  dailyAdjustmentMessage,
  energySourceMessage,
  needsPace,
  noteTone,
  proteinBasisMessage,
} from './labels'
import { useProfile } from './useProfile'

/** Profile summary + daily targets (read-only reference) + edit profile + log out. */
export function ProfilePage() {
  const navigate = useNavigate()
  const { data, isPending, error } = useProfile()
  const [exporting, setExporting] = useState(false)

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

  // "Perder grasa · Moderado (-0,85 kg/sem) · Alta en proteína · Vegetariana"
  const planParts = [GOAL_LABELS[profile.goal].title]
  if (needsPace(profile.goal) && profile.pace) {
    planParts.push(`${PACE_LABELS[profile.pace]} (${formatSignedWeight(targets.weeklyRateKg)} kg/sem)`)
  }
  planParts.push(DIET_STYLE_LABELS[profile.dietStyle].title)
  if (profile.dietaryRestrictions.length > 0) {
    planParts.push(profile.dietaryRestrictions.map((restriction) => DIETARY_RESTRICTION_LABELS[restriction]).join(', '))
  }
  const notes = targets.notes ?? []
  const energySource = energySourceMessage(targets.energySource, targets.adaptiveSince)

  return (
    <Screen title="Perfil" icon={<BrandMark size="sm" className="mr-1" />}>
      <p className="mb-5 text-sm text-ink-muted">
        {SEX_LABELS[profile.sex]} · {ACTIVITY_LABELS[profile.activityLevel].title}
      </p>

      <Card className="mb-5">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          <Target className="size-4" aria-hidden="true" />
          Tu plan
        </p>
        <p className="text-base font-semibold text-ink">{planParts.join(' · ')}</p>
        <p className="mt-1.5 text-sm text-ink-muted">{dailyAdjustmentMessage(targets.dailyAdjustmentKcal)}</p>
      </Card>

      {notes.map((note) => (
        <Banner key={note.code} tone={noteTone(note.code)} className="mb-5">
          {note.message}
        </Banner>
      ))}

      <Card className="mb-6">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          <Flame className="size-4" aria-hidden="true" />
          Objetivos diarios
        </p>
        <p className="mb-1 text-3xl font-bold text-ink">
          {formatNumber(targets.calories)} <span className="text-base font-medium text-ink-muted">kcal</span>
        </p>
        <div className="mb-4">
          <p className="text-xs text-ink-muted">{energySource.primary}</p>
          {energySource.hint && <p className="mt-0.5 text-xs text-ink-muted/70">{energySource.hint}</p>}
        </div>

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

        <p className="mb-3 text-xs text-ink-muted">{proteinBasisMessage(targets.proteinBasis, targets.proteinBasisKg)}</p>

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
          variant="secondary"
          icon={<Download className="size-5" aria-hidden="true" />}
          onClick={() => setExporting(true)}
        >
          Exportar mis datos
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

      {exporting && <ExportDataSheet onClose={() => setExporting(false)} />}
    </Screen>
  )
}
