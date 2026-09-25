import { Clock, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatNumber } from '../../lib/format'
import type { SuggestionOption } from './types'

interface Chip {
  label: string
  color: string
  tint: string
}

function chipsFor(option: SuggestionOption): Chip[] {
  return [
    { label: `${formatNumber(option.totals.kcal)} kcal`, color: 'var(--color-primary-300)', tint: 'var(--color-primary-tint)' },
    { label: `P ${formatNumber(option.totals.protein)} g`, color: 'var(--color-protein)', tint: 'var(--color-protein-tint)' },
    { label: `C ${formatNumber(option.totals.carbs)} g`, color: 'var(--color-carbs)', tint: 'var(--color-carbs-tint)' },
    { label: `G ${formatNumber(option.totals.fat)} g`, color: 'var(--color-fat)', tint: 'var(--color-fat-tint)' },
  ]
}

interface SuggestionOptionCardProps {
  option: SuggestionOption
  onRegister: () => void
}

/** One suggested-meal result card: title, description, prep time, macro chips, "por qué te sirve", and a Registrar CTA. */
export function SuggestionOptionCard({ option, onRegister }: SuggestionOptionCardProps) {
  return (
    <Card className="space-y-3">
      <div>
        <p className="font-semibold text-ink capitalize">{option.title}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{option.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-xs text-ink-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          {option.prepMinutes} min
        </span>
        {chipsFor(option).map((chip) => (
          <span
            key={chip.label}
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: chip.tint, color: chip.color }}
          >
            {chip.label}
          </span>
        ))}
      </div>

      <p className="flex items-start gap-1.5 text-sm text-ink-muted">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary-300" aria-hidden="true" />
        {option.why}
      </p>

      <Button size="md" onClick={onRegister}>
        Registrar
      </Button>
    </Card>
  )
}
