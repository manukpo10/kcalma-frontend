import { CalendarCheck, Circle } from 'lucide-react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatShortDate } from '../../lib/date'
import { formatNumber, formatSignedWeight } from '../../lib/format'
import { confidenceInfo } from './labels'
import type { CheckinResponse } from './types'

interface CheckinDetailSheetProps {
  data: CheckinResponse
  onClose: () => void
}

/**
 * Read-only explanation behind the Hoy check-in card's "Ver detalle": how the average intake and
 * weight trend over the window translate into a real-expenditure estimate, the confidence level
 * with a one-line meaning, and — for INSUFFICIENT_DATA — the missing-data checklist. Driven
 * entirely by the `CheckinResponse` prop so it renders correctly for any status without knowing
 * which entry point reached it.
 */
export function CheckinDetailSheet({ data, onClose }: CheckinDetailSheetProps) {
  const confidence = confidenceInfo(data.confidence)
  const hasReasons = data.reasons.length > 0
  const hasEstimate = data.avgIntakeKcal !== null && data.trendChangeKg !== null && data.estimatedTdee !== null

  return (
    <Sheet onClose={onClose} ariaLabel="Detalle del chequeo semanal">
      <p className="mb-1 flex items-center gap-2 text-lg font-bold text-ink">
        <CalendarCheck className="size-5 text-teal-400" aria-hidden="true" />
        Chequeo semanal
      </p>
      <p className="mb-4 text-xs text-ink-muted">
        {formatShortDate(data.windowStart)} – {formatShortDate(data.windowEnd)}
      </p>

      {hasEstimate ? (
        <div className="mb-4 space-y-3 text-sm text-ink-muted">
          <p>
            Hubo registro de comidas en {data.completeDays ?? '—'} días
            {data.weighIns !== null ? ` y ${data.weighIns} pesadas` : ''} durante esta ventana, con un promedio de{' '}
            <span className="font-medium text-ink">{formatNumber(data.avgIntakeKcal as number)} kcal</span> por día y
            un cambio de peso de{' '}
            <span className="font-medium text-ink">{formatSignedWeight(data.trendChangeKg as number)} kg</span>.
          </p>
          <p>
            Esa combinación indica un gasto diario real de{' '}
            <span className="font-medium text-ink">{formatNumber(data.estimatedTdee as number)} kcal</span>
            {data.formulaTdee !== null && ` (la fórmula estimaba ${formatNumber(data.formulaTdee)} kcal)`}.
            {data.currentTargetKcal !== null && data.proposedTargetKcal !== null && (
              <>
                {' '}
                Propuesta: pasar el objetivo de {formatNumber(data.currentTargetKcal)} a{' '}
                {formatNumber(data.proposedTargetKcal)} kcal.
              </>
            )}
          </p>
        </div>
      ) : (
        <Banner tone="info" className="mb-4">
          Todavía no hay suficientes datos para calcular una propuesta esta semana.
        </Banner>
      )}

      {hasReasons && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">Falta</p>
          <ul className="space-y-2">
            {data.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <Circle className="mt-1 size-3 shrink-0" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-5 rounded-lg bg-surface-2 px-4 py-3">
        <p className="text-sm font-semibold text-ink">Confianza: {confidence.title}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{confidence.meaning}</p>
      </div>

      <Button variant="ghost" onClick={onClose}>
        Cerrar
      </Button>
    </Sheet>
  )
}
