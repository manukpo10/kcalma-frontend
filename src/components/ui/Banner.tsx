import { CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type BannerTone = 'info' | 'warning' | 'danger' | 'success'

interface BannerProps {
  tone?: BannerTone
  children: ReactNode
  className?: string
}

const TONE_CONFIG: Record<BannerTone, { bg: string; fg: string; Icon: typeof Info }> = {
  info: { bg: 'var(--color-info-tint)', fg: 'var(--color-info)', Icon: Info },
  warning: { bg: 'var(--color-warning-tint)', fg: 'var(--color-warning)', Icon: TriangleAlert },
  danger: { bg: 'var(--color-danger-tint)', fg: 'var(--color-danger)', Icon: TriangleAlert },
  success: { bg: 'var(--color-success-tint)', fg: 'var(--color-success)', Icon: CircleCheck },
}

/** Subtle inline banner for contextual notes, e.g. the calorie-floor explanation. */
export function Banner({ tone = 'info', children, className }: BannerProps) {
  const { bg, fg, Icon } = TONE_CONFIG[tone]
  const role = tone === 'danger' ? 'alert' : 'status'

  return (
    <div
      role={role}
      className={cn('flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm', className)}
      style={{ backgroundColor: bg, color: fg }}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="leading-snug">{children}</p>
    </div>
  )
}
