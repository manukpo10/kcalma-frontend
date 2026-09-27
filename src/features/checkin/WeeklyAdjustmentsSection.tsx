import { CalendarCheck } from 'lucide-react'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatShortDate } from '../../lib/date'
import { formatNumber } from '../../lib/format'
import { CHECKIN_STATUS_LABELS } from './labels'
import { TdeeHistoryChart } from './TdeeHistoryChart'
import { useCheckinHistory } from './useCheckin'

const MIN_ENTRIES_FOR_CHART = 3

/**
 * Optional "Ajustes semanales" block on Progreso: history of the adaptive-TDEE weekly check-ins
 * plus (once there are enough weeks) a small trend chart. Errors are swallowed (section just
 * hides) — same optional-add-on contract as MeasurementsSection, since Sprint 3a's endpoint may
 * not exist on every backend deploy yet and a hiccup here must never block the rest of Progreso.
 */
export function WeeklyAdjustmentsSection() {
  const { data, isPending, isError } = useCheckinHistory(12)

  if (isPending) {
    return <Skeleton className="mb-6 h-40 w-full rounded-xl" />
  }

  if (isError || !data || data.length === 0) {
    return null
  }

  const chronological = [...data].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
  const newestFirst = [...chronological].reverse()

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
        <CalendarCheck className="size-4" aria-hidden="true" />
        Ajustes semanales
      </p>

      {chronological.length >= MIN_ENTRIES_FOR_CHART && <TdeeHistoryChart entries={chronological} />}

      <div className="mb-6 space-y-2">
        {newestFirst.map((entry) => (
          <div
            key={entry.weekStart}
            className="flex items-center justify-between rounded-xl bg-surface p-3.5 shadow-xs"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink capitalize">{formatShortDate(entry.weekStart)}</span>
              <span className="text-xs text-ink-muted">{CHECKIN_STATUS_LABELS[entry.status]}</span>
            </span>
            <span className="ml-3 shrink-0 text-right">
              {entry.estimatedTdee !== null ? (
                <span className="block text-sm font-semibold text-ink">{formatNumber(entry.estimatedTdee)} kcal est.</span>
              ) : (
                <span className="block text-sm text-ink-muted">—</span>
              )}
              {entry.appliedTdee !== null && (
                <span className="block text-xs text-ink-muted">{formatNumber(entry.appliedTdee)} kcal aplicadas</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
