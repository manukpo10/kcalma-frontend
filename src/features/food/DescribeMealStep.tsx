import { useId } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { cn } from '../../lib/cn'

export const MAX_DESCRIPTION_LENGTH = 500

const PLACEHOLDER = 'Ej: 2 empanadas de carne y una ensalada chica, o un plato de fideos con tuco'

interface DescribeMealStepProps {
  value: string
  onChange: (value: string) => void
  onAnalyze: () => void
  error: string | null
}

/**
 * Free-text description of a meal in Spanish ("un plato de fideos con tuco"), analyzed by
 * Gemini into the same detected-items shape as the photo flow. Controlled by the parent so the
 * text survives a round trip through the shared "analyzing" step if the request fails.
 */
export function DescribeMealStep({ value, onChange, onAnalyze, error }: DescribeMealStepProps) {
  const counterId = useId()
  const trimmed = value.trim()
  const atLimit = value.length >= MAX_DESCRIPTION_LENGTH

  return (
    <div className="space-y-4">
      {error && <Banner tone="danger">{error}</Banner>}

      <div>
        <Textarea
          label="¿Qué comiste?"
          placeholder={PLACEHOLDER}
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={5}
          aria-describedby={counterId}
        />
        <p id={counterId} className={cn('mt-1.5 text-right text-xs', atLimit ? 'text-danger' : 'text-ink-muted')}>
          {value.length}/{MAX_DESCRIPTION_LENGTH}
        </p>
      </div>

      <Button size="lg" onClick={onAnalyze} disabled={!trimmed}>
        Analizar
      </Button>
    </div>
  )
}
