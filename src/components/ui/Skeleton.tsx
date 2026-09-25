import { cn } from '../../lib/cn'

/** Loading placeholder block. Prefer this over a blank screen or spinner-only state. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} aria-hidden="true" />
}
