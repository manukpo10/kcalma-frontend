import { CalendarCheck, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useToast } from '../../components/ui/ToastProvider'
import { formatNumber } from '../../lib/format'
import { CheckinDetailSheet } from './CheckinDetailSheet'
import { useAcceptCheckin, useCheckin, useDismissCheckin } from './useCheckin'

/**
 * "Chequeo semanal" card on Hoy — only rendered while this week's check-in is PENDING and has the
 * numbers a proposal needs. Every other status (or the endpoint not existing on this backend
 * deploy yet, or a malformed/partial payload) renders nothing: see `useCheckin`'s `isError`
 * contract and the CRITICAL deploy note in the repo — this feature must never show an error
 * banner or crash Hoy just because the backend hasn't caught up yet.
 */
export function CheckinCard() {
  const { data, isPending, isError } = useCheckin()
  const accept = useAcceptCheckin()
  const dismiss = useDismissCheckin()
  const { showToast } = useToast()
  const [showDetail, setShowDetail] = useState(false)

  if (isPending || isError || !data || data.status !== 'PENDING') {
    return null
  }

  const { estimatedTdee, currentTargetKcal, proposedTargetKcal } = data
  if (estimatedTdee === null || currentTargetKcal === null || proposedTargetKcal === null) {
    // The contract says PENDING implies these are set — stay silent rather than show a broken sentence.
    return null
  }

  const busy = accept.isPending || dismiss.isPending

  const handleAccept = async () => {
    try {
      await accept.mutateAsync()
      showToast({ message: `Objetivo actualizado a ${formatNumber(proposedTargetKcal)} kcal.` })
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'No se pudo actualizar el objetivo.' })
    }
  }

  const handleDismiss = async () => {
    try {
      await dismiss.mutateAsync()
      showToast({ message: 'Objetivo sin cambios. El próximo chequeo llega en una semana.' })
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'No se pudo guardar la elección.' })
    }
  }

  return (
    <Card className="mb-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-teal-tint)', color: 'var(--color-teal-400)' }}
        >
          <CalendarCheck className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-ink">Chequeo semanal</p>
      </div>

      <p className="mb-3 text-sm text-ink-muted">
        Con tus datos reales, tu gasto diario parece ser de {formatNumber(estimatedTdee)} kcal. Propuesta: pasar tu
        objetivo de {formatNumber(currentTargetKcal)} a {formatNumber(proposedTargetKcal)} kcal.
      </p>

      <button
        type="button"
        onClick={() => setShowDetail(true)}
        className="mb-3 flex h-11 items-center gap-1 text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200"
      >
        Ver detalle
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>

      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" loading={accept.isPending} disabled={busy} onClick={() => void handleAccept()}>
          Aceptar
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          loading={dismiss.isPending}
          disabled={busy}
          onClick={() => void handleDismiss()}
        >
          Ahora no
        </Button>
      </div>

      {showDetail && <CheckinDetailSheet data={data} onClose={() => setShowDetail(false)} />}
    </Card>
  )
}
