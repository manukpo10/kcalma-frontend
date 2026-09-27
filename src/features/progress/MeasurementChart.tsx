import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { cn } from '../../lib/cn'
import { formatLongDate, formatShortDate } from '../../lib/date'
import { formatDecimal } from '../../lib/format'
import { MEASUREMENT_METRICS } from './measurementLabels'
import type { MeasurementEntry, MeasurementField } from './types'

interface MeasurementChartProps {
  /** Sorted oldest -> newest. */
  entries: MeasurementEntry[]
}

interface ChartPoint {
  date: string
  value: number
}

/**
 * Small trend chart for one body-measurement metric at a time, picked from the pill row above it
 * — one hue, recessive grid, hover tooltip, and a text alternative, same visual language as
 * WeightChart but simpler: a single series, no goal/trend overlay. Entries missing the selected
 * metric are skipped rather than plotted as 0, so a gap in logging never reads as a real drop.
 */
export function MeasurementChart({ entries }: MeasurementChartProps) {
  const metricsWithData = MEASUREMENT_METRICS.filter((metric) => entries.some((entry) => entry[metric.key] !== null))
  const [selectedKey, setSelectedKey] = useState<MeasurementField | null>(metricsWithData[0]?.key ?? null)

  if (metricsWithData.length === 0) {
    return null
  }

  const activeMetric = metricsWithData.find((metric) => metric.key === selectedKey) ?? metricsWithData[0]
  const points: ChartPoint[] = entries
    .filter((entry) => entry[activeMetric.key] !== null)
    .map((entry) => ({ date: entry.date, value: entry[activeMetric.key] as number }))
  const showDots = points.length <= 90

  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Métrica del gráfico">
        {metricsWithData.map((metric) => {
          const selected = metric.key === activeMetric.key
          return (
            <button
              key={metric.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedKey(metric.key)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
                selected ? 'bg-primary text-primary-fg' : 'bg-surface-2 text-ink-muted hover:text-ink',
              )}
            >
              {metric.shortLabel}
            </button>
          )
        })}
      </div>

      {points.length < 2 ? (
        <div className="flex h-32 flex-col items-center justify-center text-center">
          <p className="text-sm text-ink-muted">
            Registrá {activeMetric.label.toLowerCase()} más de una vez para ver la tendencia.
          </p>
        </div>
      ) : (
        <div role="img" aria-label={buildChartSummary(points, activeMetric.label, activeMetric.unit)}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-hairline)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-hairline)' }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={36}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={(tooltipProps: TooltipContentProps) => (
                  <MeasurementTooltip {...tooltipProps} unit={activeMetric.unit} />
                )}
                cursor={{ stroke: 'var(--color-hairline)', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary-400)"
                strokeWidth={2.5}
                dot={showDots ? { r: 4, fill: 'var(--color-primary-300)', strokeWidth: 0 } : false}
                activeDot={{ r: 5, fill: 'var(--color-primary-400)' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function MeasurementTooltip({ active, payload, unit }: TooltipContentProps & { unit: string }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload as ChartPoint | undefined
  if (!point) return null

  return (
    <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">{formatLongDate(point.date)}</p>
      <p className="text-ink-muted">
        <span className="font-medium text-ink">{formatDecimal(point.value)}</span> {unit}
      </p>
    </div>
  )
}

/** Text alternative for screen readers — the chart itself is presented as a single image. */
function buildChartSummary(points: ChartPoint[], label: string, unit: string): string {
  const first = points[0]
  const last = points[points.length - 1]
  const change = last.value - first.value
  const direction = change < -0.05 ? 'bajó' : change > 0.05 ? 'subió' : 'se mantuvo estable en'
  const changeText =
    Math.abs(change) < 0.05
      ? `${formatDecimal(last.value)} ${unit}`
      : `de ${formatDecimal(first.value)} ${unit} a ${formatDecimal(last.value)} ${unit}`
  return `Gráfico de ${label.toLowerCase()}: ${direction} ${changeText} entre el ${formatLongDate(first.date)} y el ${formatLongDate(last.date)}.`
}
