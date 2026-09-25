import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends Omit<ComponentProps<'div'>, 'className'> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

/** Base surface container reused across every screen. */
export function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface shadow-sm',
        PADDING_CLASSES[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
