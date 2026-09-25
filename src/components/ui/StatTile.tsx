import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ProgressBar } from './ProgressBar'

interface StatTileProps {
  icon: ReactNode
  label: string
  value: string
  sublabel?: string
  color?: string
  tint?: string
  /** 0-100. Omit to render the tile without a progress bar. */
  progress?: number
  className?: string
}

/** Compact tile for a single metric — used for macros and secondary targets. */
export function StatTile({
  icon,
  label,
  value,
  sublabel,
  color = 'var(--color-primary-400)',
  tint = 'var(--color-primary-tint)',
  progress,
  className,
}: StatTileProps) {
  return (
    <div className={cn('rounded-xl bg-surface p-3.5 shadow-sm', className)}>
      <div className="mb-2.5 flex flex-col items-start gap-1.5">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: tint, color }}
        >
          {icon}
        </span>
        <span className="w-full text-xs leading-tight font-medium break-words text-ink-muted [hyphens:auto]">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-ink">
        {value}
        {sublabel && <span className="ml-1 text-sm font-normal text-ink-muted">{sublabel}</span>}
      </p>
      {progress !== undefined && (
        <ProgressBar value={progress} color={color} className="mt-2.5" aria-label={label} />
      )}
    </div>
  )
}
