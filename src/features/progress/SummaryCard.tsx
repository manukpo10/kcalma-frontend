import { Minus, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatPercent, formatSignedWeight, formatWeight } from '../../lib/format'
import { goalMessage } from './labels'
import type { ProgressStats } from './types'

interface SummaryCardProps {
  stats: ProgressStats
  onSetGoal: () => void
}

/** Trend weight, change since the start of the range, weekly rate, and goal progress. */
export function SummaryCard({ stats, onSetGoal }: SummaryCardProps) {
  if (stats.trendKg === null) {
    return (
      <div className="mb-5 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-950 p-6 text-center shadow-md">
        <Scale className="mx-auto mb-3 size-8 text-teal-200" aria-hidden="true" />
        <p className="text-sm text-teal-100">Registrá tu peso para ver tu tendencia.</p>
      </div>
    )
  }

  const message = goalMessage(stats)
  const changeIsFlat = stats.changeKg === null || Math.abs(stats.changeKg) < 0.05
  const ChangeIcon = changeIsFlat ? Minus : (stats.changeKg as number) < 0 ? TrendingDown : TrendingUp
  const rateIsFlat = stats.weeklyRateKg === null || Math.abs(stats.weeklyRateKg) < 0.02
  const RateIcon = rateIsFlat ? Minus : (stats.weeklyRateKg as number) < 0 ? TrendingDown : TrendingUp

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-950 p-6 shadow-md">
      <p className="mb-1 text-center text-xs font-semibold tracking-wide text-teal-200 uppercase">Peso actual (tendencia)</p>
      <p className="mb-5 text-center text-4xl font-bold text-white">
        {formatWeight(stats.trendKg)} <span className="text-lg font-medium text-teal-200">kg</span>
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
          <p className="mb-1 flex items-center justify-center gap-1 text-xs text-teal-200">
            <ChangeIcon className="size-3.5" aria-hidden="true" />
            Desde el inicio
          </p>
          <p className="text-lg font-semibold text-white">
            {stats.changeKg !== null ? `${formatSignedWeight(stats.changeKg)} kg` : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
          <p className="mb-1 flex items-center justify-center gap-1 text-xs text-teal-200">
            <RateIcon className="size-3.5" aria-hidden="true" />
            Por semana
          </p>
          <p className="text-lg font-semibold text-white">
            {stats.weeklyRateKg !== null ? `${formatSignedWeight(stats.weeklyRateKg)} kg` : '—'}
          </p>
        </div>
      </div>

      {stats.goalWeightKg === null ? (
        <button
          type="button"
          onClick={onSetGoal}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors active:scale-[0.98] hover:bg-white/15 active:bg-white/20"
        >
          <Scale className="size-4 text-primary-400" aria-hidden="true" />
          Definir peso objetivo
        </button>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-teal-200">
            <span>Meta: {formatWeight(stats.goalWeightKg)} kg</span>
            {stats.progressPct !== null && <span>{formatPercent(stats.progressPct)}</span>}
          </div>
          <ProgressBar
            value={stats.progressPct ?? 0}
            color="var(--color-primary-400)"
            trackColor="rgb(255 255 255 / 0.15)"
            aria-label="Progreso hacia la meta"
          />
          {message && <p className="mt-2.5 text-center text-sm text-teal-100">{message.text}</p>}
        </div>
      )}
    </div>
  )
}
