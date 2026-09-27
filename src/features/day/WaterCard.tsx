import { GlassWater, Minus, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useToast } from '../../components/ui/ToastProvider'
import { formatLiters } from '../../lib/format'
import type { DayWater } from './types'
import { useAddWater } from './useWater'

interface WaterCardProps {
  date: string
  water: DayWater
}

const QUICK_ADD_ML = [250, 500] as const
const QUICK_REMOVE_ML = 250

/**
 * Water tracker for "Hoy": consumed/target as liters with a progress bar, plus quick-adjust
 * buttons. Every tap is optimistic (see `useAddWater`) and undoable via the shared Toast — the
 * same "act now, offer Deshacer" pattern as every other change in the app (EditEntryModal,
 * DeleteMealModal).
 */
export function WaterCard({ date, water }: WaterCardProps) {
  const addWater = useAddWater()
  const { showToast } = useToast()

  const handleChange = (deltaMl: number) => {
    void addWater.mutateAsync({ date, deltaMl })
    const verb = deltaMl > 0 ? 'Agregaste' : 'Restaste'
    showToast({
      message: `${verb} ${Math.abs(deltaMl)} ml de agua · Deshacer`,
      actionLabel: 'Deshacer',
      onAction: async () => {
        await addWater.mutateAsync({ date, deltaMl: -deltaMl })
      },
    })
  }

  const canRemove = water.consumedMl > 0

  return (
    <Card className="mb-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-teal-tint)', color: 'var(--color-teal-400)' }}
        >
          <GlassWater className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Agua</p>
          <p className="text-xs text-ink-muted">
            {formatLiters(water.consumedMl / 1000)} / {formatLiters(water.targetMl / 1000)} L
          </p>
        </div>
      </div>

      <ProgressBar
        value={water.consumedMl}
        max={water.targetMl}
        color="var(--color-teal-400)"
        className="mb-4"
        aria-label="Agua consumida"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleChange(-QUICK_REMOVE_ML)}
          disabled={!canRemove}
          aria-label={`Restar ${QUICK_REMOVE_ML} ml de agua`}
          className="flex h-11 shrink-0 items-center justify-center gap-1 rounded-full bg-surface-2 px-3 text-sm font-semibold text-ink-muted transition-colors hover:text-ink active:bg-hairline disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden="true" />
          {QUICK_REMOVE_ML}
        </button>
        {QUICK_ADD_ML.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleChange(amount)}
            className="flex h-11 flex-1 items-center justify-center gap-1 rounded-full bg-surface-2 text-sm font-semibold text-ink transition-colors hover:bg-hairline active:bg-hairline"
          >
            <Plus className="size-4" aria-hidden="true" />
            {amount} ml
          </button>
        ))}
      </div>
    </Card>
  )
}
