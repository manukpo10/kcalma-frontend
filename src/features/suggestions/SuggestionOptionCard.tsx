import { Clock, Sparkles, TriangleAlert } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { MacroChips } from '../../components/ui/MacroChips'
import type { SuggestionOption } from './types'

interface SuggestionOptionCardProps {
  option: SuggestionOption
  onRegister: () => void
}

/** One suggested-meal result card: title, description, prep time, macro chips, "por qué te sirve", and a Registrar CTA. */
export function SuggestionOptionCard({ option, onRegister }: SuggestionOptionCardProps) {
  const hasEstimatedItem = option.items.some((item) => item.source === 'ESTIMATED')

  return (
    <Card className="space-y-3">
      <div>
        <p className="font-semibold text-ink capitalize">{option.title}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{option.description}</p>
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          {option.prepMinutes} min
        </span>
        <MacroChips
          kcal={option.totals.kcal}
          protein={option.totals.protein}
          fat={option.totals.fat}
          carbs={option.totals.carbs}
        />
      </div>

      <p className="flex items-start gap-1.5 text-sm text-ink-muted">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary-300" aria-hidden="true" />
        {option.why}
      </p>

      {hasEstimatedItem && (
        <p className="flex items-start gap-1.5 text-xs text-ink-muted">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" style={{ color: 'var(--color-warning)' }} aria-hidden="true" />
          Algunos valores son estimados por IA — revisalos al registrar.
        </p>
      )}

      <Button size="md" onClick={onRegister}>
        Registrar
      </Button>
    </Card>
  )
}
