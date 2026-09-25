import { cn } from '../../lib/cn'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  trackClassName?: string
  className?: string
  'aria-label'?: string
}

/** Thin linear progress bar. Pass a CSS color (e.g. "var(--color-protein)") via `color`. */
export function ProgressBar({
  value,
  max = 100,
  color = 'var(--color-primary)',
  trackClassName,
  className,
  ...props
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={props['aria-label']}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-2', trackClassName, className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  )
}
