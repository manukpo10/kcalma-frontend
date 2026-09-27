import { Pencil, Ruler } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatShortDate } from '../../lib/date'
import { formatDecimal, formatSignedDecimal } from '../../lib/format'
import { EditMeasurementSheet } from './EditMeasurementSheet'
import { MeasurementChart } from './MeasurementChart'
import { MEASUREMENT_METRICS } from './measurementLabels'
import { RegisterMeasurementsSheet } from './RegisterMeasurementsSheet'
import type { MeasurementEntry } from './types'
import { useMeasurements } from './useMeasurements'

interface MeasurementsSectionProps {
  from: string
  to: string
}

const MAX_VISIBLE_ENTRIES = 10
/** Below this, a change vs. the previous measurement reads as noise rather than a real move. */
const FLAT_DELTA_THRESHOLD = 0.05

/**
 * Optional "Medidas" block on Progreso: a compact invite card until at least one measurement
 * exists, then the latest values with their change vs. the previous entry, a metric chart, and a
 * pencil-affordance history list — one level down from the weight-tracking section above it.
 * Errors are swallowed (section just hides) since this is explicitly an optional add-on: a
 * measurements hiccup should never block the weight/nutrition content the rest of the page shows.
 */
export function MeasurementsSection({ from, to }: MeasurementsSectionProps) {
  const { data, isPending, isError } = useMeasurements(from, to)
  const [registering, setRegistering] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MeasurementEntry | null>(null)

  const sortedEntries = useMemo(
    () => (data ? [...data].sort((a, b) => a.date.localeCompare(b.date)) : []),
    [data],
  )

  if (isPending) {
    return <Skeleton className="mb-6 h-40 w-full rounded-xl" />
  }

  if (isError) {
    return null
  }

  if (sortedEntries.length === 0) {
    return (
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-muted">Medidas</p>
        <Card className="mb-6 text-center">
          <Ruler className="mx-auto mb-3 size-8 text-ink-muted" aria-hidden="true" />
          <p className="mb-4 text-sm text-ink-muted">
            Registrá tus medidas corporales para ver cómo cambian con el tiempo.
          </p>
          <Button icon={<Ruler className="size-5" aria-hidden="true" />} onClick={() => setRegistering(true)}>
            Registrar medidas
          </Button>
        </Card>
        {registering && (
          <RegisterMeasurementsSheet onClose={() => setRegistering(false)} onSaved={() => setRegistering(false)} />
        )}
      </div>
    )
  }

  const latest = sortedEntries[sortedEntries.length - 1]
  const previous = sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 2] : null
  const latestMetrics = MEASUREMENT_METRICS.filter((metric) => latest[metric.key] !== null)
  const recentFirst = [...sortedEntries].reverse().slice(0, MAX_VISIBLE_ENTRIES)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-muted">Medidas</p>
        <button
          type="button"
          onClick={() => setRegistering(true)}
          className="h-11 px-2 text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200"
        >
          Registrar
        </button>
      </div>

      {latestMetrics.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {latestMetrics.map((metric) => {
            const value = latest[metric.key] as number
            const previousValue = previous?.[metric.key] ?? null
            const delta = previousValue !== null ? value - previousValue : null
            return (
              <Card key={metric.key} padding="sm">
                <p className="mb-1 text-xs font-medium text-ink-muted">{metric.label}</p>
                <p className="text-base font-bold text-ink">
                  {formatDecimal(value)} <span className="text-xs font-medium text-ink-muted">{metric.unit}</span>
                </p>
                {delta !== null && Math.abs(delta) >= FLAT_DELTA_THRESHOLD && (
                  <p className="text-xs text-ink-muted">{formatSignedDecimal(delta)} vs. anterior</p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <div className="mb-4">
        <MeasurementChart entries={sortedEntries} />
      </div>

      <div className="mb-6 space-y-2">
        {recentFirst.map((entry) => (
          <button
            key={entry.date}
            type="button"
            onClick={() => setEditingEntry(entry)}
            aria-label={`Editar medidas del ${formatShortDate(entry.date)}`}
            className="flex w-full items-center justify-between rounded-xl bg-surface p-3.5 text-left shadow-xs transition-colors hover:bg-surface-2 active:bg-surface-2"
          >
            <span className="block font-medium text-ink capitalize">{formatShortDate(entry.date)}</span>
            <Pencil className="ml-3 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
          </button>
        ))}
      </div>

      {registering && (
        <RegisterMeasurementsSheet onClose={() => setRegistering(false)} onSaved={() => setRegistering(false)} />
      )}
      {editingEntry && (
        <EditMeasurementSheet entry={editingEntry} onClose={() => setEditingEntry(null)} onSaved={() => setEditingEntry(null)} />
      )}
    </div>
  )
}
