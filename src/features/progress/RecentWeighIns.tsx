import { Pencil } from 'lucide-react'
import { formatShortDate } from '../../lib/date'
import { formatSignedWeight, formatWeight } from '../../lib/format'
import type { WeightPoint } from './types'

interface RecentWeighInsProps {
  weights: WeightPoint[]
  onEdit: (point: WeightPoint) => void
}

/** Most recent weigh-ins for the selected range are shown; the pencil affordance edits/deletes each. */
const MAX_VISIBLE = 15

/** Newest first, each row opening the edit/delete sheet on tap — capped so a long range stays scannable. */
export function RecentWeighIns({ weights, onEdit }: RecentWeighInsProps) {
  if (weights.length === 0) {
    return null
  }

  const newestFirst = [...weights].reverse()
  const visible = newestFirst.slice(0, MAX_VISIBLE)

  return (
    <div className="space-y-2">
      {visible.map((point) => {
        const indexInFull = newestFirst.indexOf(point)
        const previous = newestFirst[indexInFull + 1]
        const delta = previous ? point.weightKg - previous.weightKg : null

        return (
          <button
            key={point.date}
            type="button"
            onClick={() => onEdit(point)}
            aria-label={`Editar peso del ${formatShortDate(point.date)}`}
            className="flex w-full items-center justify-between rounded-xl bg-surface p-3.5 text-left shadow-xs transition-colors hover:bg-surface-2 active:bg-surface-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink capitalize">{formatShortDate(point.date)}</span>
              {delta !== null && <span className="text-xs text-ink-muted">{formatSignedWeight(delta)} kg vs. anterior</span>}
            </span>
            <span className="ml-3 shrink-0 font-semibold text-ink">{formatWeight(point.weightKg)} kg</span>
            <Pencil className="ml-3 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
