import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { formatLongDate, formatShortDate } from '../../lib/date'
import { formatNumber } from '../../lib/format'
import type { CheckinHistoryEntry } from './types'

interface TdeeHistoryChartProps {
  /** Chronological (oldest first). */
  entries: CheckinHistoryEntry[]
}

/**
 * Small trend line of the estimated TDEE from each weekly check-in. A single series, so per the
 * dataviz guideline it skips a legend box — the caption above names it instead — reusing the same
 * primary hue WeightChart already uses for its own "the number that matters" trend line. Weeks
 * without an estimate (INSUFFICIENT_DATA) stay as null points so the x-axis stays chronologically
 * even; Recharts breaks the line across them rather than connecting.
 */
export function TdeeHistoryChart({ entries }: TdeeHistoryChartProps) {
  const plottable = entries.filter((entry) => entry.estimatedTdee !== null)
  if (plottable.length === 0) return null

  const values = plottable.map((entry) => entry.estimatedTdee as number)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = Math.max(40, (maxValue - minValue) * 0.2)

  return (
    <div className="mb-4 rounded-xl bg-surface p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium text-ink-muted">TDEE estimado por semana</p>
      <div role="img" aria-label={buildChartSummary(plottable)}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={entries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-hairline)" />
            <XAxis
              dataKey="weekStart"
              tickFormatter={formatShortDate}
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-hairline)' }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[minValue - padding, maxValue + padding]}
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={38}
              tickFormatter={(value: number) => formatNumber(value)}
            />
            <Tooltip content={TdeeTooltip} cursor={{ stroke: 'var(--color-hairline)', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="estimatedTdee"
              stroke="var(--color-primary-400)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--color-primary-400)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'var(--color-primary-400)' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TdeeTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload as CheckinHistoryEntry | undefined
  if (!entry || entry.estimatedTdee === null) return null

  return (
    <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">{formatLongDate(entry.weekStart)}</p>
      <p className="text-ink-muted">
        TDEE estimado: <span className="font-medium text-ink">{formatNumber(entry.estimatedTdee)} kcal</span>
      </p>
    </div>
  )
}

/** Text alternative for screen readers — the chart itself is presented as a single image. */
function buildChartSummary(plottable: CheckinHistoryEntry[]): string {
  const first = plottable[0]
  const last = plottable[plottable.length - 1]
  const firstValue = first.estimatedTdee as number
  const lastValue = last.estimatedTdee as number
  const changeKcal = lastValue - firstValue
  const direction = changeKcal < -20 ? 'bajó' : changeKcal > 20 ? 'subió' : 'se mantuvo estable en'
  const changeText =
    Math.abs(changeKcal) <= 20
      ? `${formatNumber(lastValue)} kcal`
      : `de ${formatNumber(firstValue)} kcal a ${formatNumber(lastValue)} kcal`
  return `Gráfico de TDEE estimado: ${direction} ${changeText} entre el ${formatLongDate(first.weekStart)} y el ${formatLongDate(last.weekStart)}.`
}
