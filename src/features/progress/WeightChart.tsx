import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { formatLongDate, formatShortDate } from '../../lib/date'
import { formatWeight } from '../../lib/format'
import type { WeightPoint } from './types'

interface WeightChartProps {
  weights: WeightPoint[]
  goalWeightKg: number | null
}

/**
 * Hero chart: daily weigh-ins as dots, the smoothed trend as a prominent line, the goal as a
 * dashed reference. Built as two overlaid {@code Line}s sharing one category x-axis (dates)
 * rather than a Line+Scatter combo — a transparent-stroke Line with visible dots renders raw
 * weigh-ins, so both series stay perfectly aligned with no cross-component quirks.
 */
export function WeightChart({ weights, goalWeightKg }: WeightChartProps) {
  if (weights.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-xl bg-surface p-6 text-center">
        <p className="text-sm text-ink-muted">Registrá tu peso para ver tu tendencia.</p>
      </div>
    )
  }

  // Past ~90 points, individual dots would overplot into a smear — the line alone still reads fine.
  const showDots = weights.length <= 90

  const values = weights.flatMap((w) => [w.weightKg, w.trendKg, ...(goalWeightKg !== null ? [goalWeightKg] : [])])
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = Math.max(0.5, (maxValue - minValue) * 0.15)

  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm">
      <div role="img" aria-label={buildChartSummary(weights, goalWeightKg)}>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={weights} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
              domain={[minValue - padding, maxValue + padding]}
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={34}
              tickFormatter={(value: number) => formatWeight(value)}
            />
            {goalWeightKg !== null && (
              <ReferenceLine
                y={goalWeightKg}
                stroke="var(--color-teal-400)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'Meta', position: 'insideTopRight', fill: 'var(--color-teal-300)', fontSize: 11 }}
              />
            )}
            <Tooltip content={WeightTooltip} cursor={{ stroke: 'var(--color-hairline)', strokeWidth: 1 }} />
            <Line
              dataKey="weightKg"
              stroke="transparent"
              isAnimationActive={false}
              dot={showDots ? { r: 4, fill: 'var(--color-primary-300)', strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: 'var(--color-primary-300)', strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="trendKg"
              stroke="var(--color-primary-400)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: 'var(--color-primary-400)' }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-primary-300" />
          Peso registrado
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-primary-400" />
          Tendencia
        </span>
        {goalWeightKg !== null && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-0.5 w-3 rounded-full border-t-2 border-dashed border-teal-400" />
            Meta
          </span>
        )}
      </div>
    </div>
  )
}

function WeightTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload as WeightPoint | undefined
  if (!point) return null

  return (
    <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">{formatLongDate(point.date)}</p>
      <p className="text-ink-muted">
        Peso: <span className="font-medium text-ink">{formatWeight(point.weightKg)} kg</span>
      </p>
      <p className="text-ink-muted">
        Tendencia: <span className="font-medium text-primary-300">{formatWeight(point.trendKg)} kg</span>
      </p>
    </div>
  )
}

/** Text alternative for screen readers — the chart itself is presented as a single image. */
function buildChartSummary(weights: WeightPoint[], goalWeightKg: number | null): string {
  const first = weights[0]
  const last = weights[weights.length - 1]
  const changeKg = last.trendKg - first.trendKg
  const direction = changeKg < -0.05 ? 'bajó' : changeKg > 0.05 ? 'subió' : 'se mantuvo estable en'
  const changeText =
    Math.abs(changeKg) < 0.05
      ? `${formatWeight(last.trendKg)} kg`
      : `de ${formatWeight(first.trendKg)} kg a ${formatWeight(last.trendKg)} kg`
  const goalText = goalWeightKg !== null ? ` Tu meta es ${formatWeight(goalWeightKg)} kg.` : ''
  return `Gráfico de peso: tu tendencia ${direction} ${changeText} entre el ${formatLongDate(first.date)} y el ${formatLongDate(last.date)}.${goalText}`
}
