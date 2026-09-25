import { Leaf } from 'lucide-react'
import { cn } from '../../lib/cn'

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'size-9 rounded-lg',
  md: 'size-14 rounded-xl',
  lg: 'size-20 rounded-2xl',
}

const ICON_SIZE_CLASSES = {
  sm: 'size-5',
  md: 'size-7',
  lg: 'size-10',
}

/** Kcalma's brand glyph — a leaf on a primary gradient, reused across auth/loading. */
export function BrandMark({ size = 'md', className }: BrandMarkProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-primary-400 to-primary-700 shadow-sm',
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Leaf className={cn('text-white', ICON_SIZE_CLASSES[size])} aria-hidden="true" strokeWidth={2.25} />
    </div>
  )
}
