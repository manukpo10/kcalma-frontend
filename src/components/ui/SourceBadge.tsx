import { Info } from 'lucide-react'
import { useState } from 'react'
import type { FoodSource } from '../../features/food/types'
import { cn } from '../../lib/cn'

interface SourceConfig {
  label: string
  explanation: string
  tone: 'neutral' | 'amber'
}

const SOURCE_CONFIG: Partial<Record<FoodSource, SourceConfig>> = {
  PERSONAL: { label: 'Tu base', explanation: 'Valores guardados de tu biblioteca personal.', tone: 'neutral' },
  USDA: { label: 'USDA', explanation: 'Valores de USDA FoodData Central.', tone: 'neutral' },
  ESTIMATED: { label: 'Estimado', explanation: 'Valor estimado por IA, revisalo.', tone: 'amber' },
}

interface SourceBadgeProps {
  source: FoodSource
  className?: string
}

/**
 * Small tappable badge disclosing where an item's nutrition values came from — "Tu base"/"USDA"
 * (neutral) or "Estimado" (amber). Tapping it shows a one-line explanation. Renders nothing for
 * MANUAL: those values are exactly what the person typed, so there's nothing to disclose.
 */
export function SourceBadge({ source, className }: SourceBadgeProps) {
  const [open, setOpen] = useState(false)
  const config = SOURCE_CONFIG[source]
  if (!config) {
    return null
  }

  const toneStyle =
    config.tone === 'amber'
      ? { backgroundColor: 'var(--color-warning-tint)', color: 'var(--color-warning)' }
      : { backgroundColor: 'var(--color-info-tint)', color: 'var(--color-info)' }

  return (
    <span className={cn('inline-block align-middle', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={toneStyle}
        // Visual pill stays small per spec, but the tap target is expanded via an invisible
        // pseudo-element to the ~44px accessibility minimum without affecting layout.
        className="relative inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap before:absolute before:-inset-3.5 before:content-['']"
        aria-expanded={open}
        aria-label={`Fuente: ${config.label}. Tocar para más información.`}
      >
        {config.label}
        <Info className="size-3" aria-hidden="true" />
      </button>
      {open && <p className="mt-1 text-xs text-ink-muted">{config.explanation}</p>}
    </span>
  )
}
