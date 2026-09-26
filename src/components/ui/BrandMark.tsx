import markWebp from '../../assets/brand/mark.webp'
import { cn } from '../../lib/cn'

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-9',
  md: 'h-14',
  lg: 'h-20',
}

/** Kcalma's "K" mark (cropped from the real logo), used in the header and loading state.
 *  WebP-only — every target platform (installed iOS PWA, iOS 14+) supports it, so there's no
 *  PNG fallback to ship. */
export function BrandMark({ size = 'md', className }: BrandMarkProps) {
  return <img src={markWebp} alt="Kcalma" className={cn('w-auto shrink-0', SIZE_CLASSES[size], className)} />
}
