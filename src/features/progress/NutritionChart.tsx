import { CalendarCheck, Drumstick, Flame, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { StatTile } from '../../components/ui/StatTile'
import { formatLongDate, formatShortDate } from '../../lib/date'
import { formatNumber, formatPercent } from '../../lib/format'
import type { NutritionDay, ProgressNutrition } from './types'

interface NutritionChartProps {
  nutrition: ProgressNutrition
}

interface ChartBucket {
  date: string
  kcal: number
  targetKcal: number
}

/** Past 60 daily points a bar chart gets unreadable — fold into weekly averages instead. */
const WEEKLY_BUCKET_THRESHOLD = 60

function bucketDays(days: NutritionDay[]): { data: ChartBucket[]; weekly: boolean } {
  if (days.length <= WEEKLY_BUCKET_THRESHOLD) {
    return { data: days.map((d) => ({ date: d.date, kcal: d.kcal, targetKcal: d.targetKcal })), weekly: false }
  }

  const buckets: ChartBucket[] = []
  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7)
    const avgKcal = Math.round(week.reduce((sum, d) => sum + d.kcal, 0) / week.length)
    buckets.push({ date: week[0].date, kcal: avgKcal, targetKcal: week[0].targetKcal })
  }
  return { data: buckets, weekly: true }
}

/** Daily kcal vs. target (bars + a target line), plus average/adherence/streak stat tiles. */
export function NutritionChart({ nutrition }: NutritionChartProps) {
  const hasData = nutrition.avgKcal !== null

  const { data, weekly } = bucketDays(nutrition.days)
  const targetKcal = data.at(-1)?.targetKcal ?? 0

  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm">
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
                width={34}
              />
              <ReferenceLine y={targetKcal} stroke="var(--color-teal-400)" strokeDasharray="4 4" strokeWidth={1.5} />
              <Tooltip
                content={(tooltipProps: TooltipContentProps) => <NutritionTooltip {...tooltipProps} weekly={weekly} />}
                cursor={{ fill: 'var(--color-surface-2)' }}
              />
              <Bar dataKey="kcal" fill="var(--color-primary-400)" radius={[4, 4, 0, 0]} maxBarSize={weekly ? 28 : 16} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2.5 rounded-sm bg-primary-400" />
              Kcal {weekly ? 'promedio semanal' : 'consumidas'}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-0.5 w-3 rounded-full border-t-2 border-dashed border-teal-400" />
              Objetivo
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <p className="text-sm text-ink-muted">Registrá comidas para ver tu historial nutricional.</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile
          icon={<Flame className="size-4" aria-hidden="true" />}
          label="Kcal promedio"
          value={nutrition.avgKcal !== null ? formatNumber(nutrition.avgKcal) : '—'}
          color="var(--color-primary-400)"
          tint="var(--color-primary-tint)"
        />
        <StatTile
          icon={<Drumstick className="size-4" aria-hidden="true" />}
          label="Proteína promedio"
          value={nutrition.avgProteinG !== null ? formatNumber(nutrition.avgProteinG) : '—'}
          sublabel={nutrition.avgProteinG !== null ? 'g' : undefined}
          color="var(--color-protein)"
          tint="var(--color-protein-tint)"
        />
        <StatTile
          icon={<Target className="size-4" aria-hidden="true" />}
          label="Adherencia"
          value={nutrition.adherencePct !== null ? formatPercent(nutrition.adherencePct) : '—'}
          color="var(--color-teal-400)"
          tint="var(--color-teal-tint)"
        />
        <StatTile
          icon={<CalendarCheck className="size-4" aria-hidden="true" />}
          label="Racha de registro"
          value={formatNumber(nutrition.loggedStreakDays)}
          sublabel={nutrition.loggedStreakDays === 1 ? 'día' : 'días'}
          color="var(--color-success)"
          tint="var(--color-success-tint)"
        />
      </div>
    </div>
  )
}

function NutritionTooltip({ active, payload, weekly }: TooltipContentProps & { weekly: boolean }) {
  if (!active || !payload?.length) return null
  const bucket = payload[0]?.payload as ChartBucket | undefined
  if (!bucket) return null

  return (
    <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">
        {weekly ? `Semana del ${formatLongDate(bucket.date)}` : formatLongDate(bucket.date)}
      </p>
      <p className="text-ink-muted">
        Kcal: <span className="font-medium text-ink">{formatNumber(bucket.kcal)}</span> / {formatNumber(bucket.targetKcal)}
      </p>
    </div>
  )
}
