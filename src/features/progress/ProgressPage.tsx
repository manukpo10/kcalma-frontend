import { Scale } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { TAB_BAR_CLEARANCE_CLASS } from '../../components/BottomTabBar'
import { Banner } from '../../components/ui/Banner'
import { BrandMark } from '../../components/ui/BrandMark'
import { Button } from '../../components/ui/Button'
import { Screen } from '../../components/ui/Screen'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { Skeleton } from '../../components/ui/Skeleton'
import { EditWeightSheet } from './EditWeightSheet'
import { RANGE_OPTIONS } from './labels'
import { NutritionChart } from './NutritionChart'
import { RecentWeighIns } from './RecentWeighIns'
import { RegisterWeightSheet } from './RegisterWeightSheet'
import { SummaryCard } from './SummaryCard'
import type { ProgressRangeKey, WeightPoint } from './types'
import { useProgress } from './useProgress'
import { WeightChart } from './WeightChart'

const SUCCESS_MESSAGE_MS = 4000

export function ProgressPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState<ProgressRangeKey>('1M')
  const [registering, setRegistering] = useState(false)
  const [editingPoint, setEditingPoint] = useState<WeightPoint | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data, isPending, error } = useProgress(range)

  useEffect(() => {
    if (!successMessage) return
    const timeoutId = window.setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [successMessage])

  const handleSaved = (targetsUpdated: boolean) => {
    setSuccessMessage(targetsUpdated ? 'Objetivos actualizados con tu nuevo peso' : 'Peso registrado')
  }

  return (
    <Screen title="Progreso" icon={<BrandMark size="sm" className="mr-1" />}>
      <div className="mb-5">
        <SegmentedControl options={RANGE_OPTIONS} value={range} onChange={setRange} aria-label="Rango de tiempo" />
      </div>

      {error && <Banner tone="danger">{error instanceof Error ? error.message : 'Error al cargar el progreso.'}</Banner>}

      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      )}

      {data && (
        <>
          <SummaryCard stats={data.stats} onSetGoal={() => navigate('/onboarding')} />

          <p className="mb-2 text-sm font-semibold text-ink-muted">Tendencia de peso</p>
          <div className="mb-5">
            <WeightChart weights={data.weights} goalWeightKg={data.stats.goalWeightKg} />
          </div>

          <div className="mb-6">
            <Button icon={<Scale className="size-5" aria-hidden="true" />} onClick={() => setRegistering(true)}>
              Registrar peso
            </Button>
          </div>

          {data.weights.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold text-ink-muted">Registros recientes</p>
              <RecentWeighIns weights={data.weights} onEdit={setEditingPoint} />
            </div>
          )}

          <p className="mb-2 text-sm font-semibold text-ink-muted">Nutrición</p>
          <div className="mb-6">
            <NutritionChart nutrition={data.nutrition} />
          </div>

          <div aria-hidden="true" className={TAB_BAR_CLEARANCE_CLASS} />
        </>
      )}

      {registering && <RegisterWeightSheet onClose={() => setRegistering(false)} onSaved={handleSaved} />}
      {editingPoint && (
        <EditWeightSheet point={editingPoint} onClose={() => setEditingPoint(null)} onSaved={handleSaved} />
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-40 flex justify-center px-4 animate-toast-in"
        >
          <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-4 shadow-lg">
            <p className="text-sm font-semibold text-ink">{successMessage}</p>
          </div>
        </div>
      )}
    </Screen>
  )
}
