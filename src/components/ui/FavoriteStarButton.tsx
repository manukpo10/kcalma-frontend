import { Star } from 'lucide-react'
import { cn } from '../../lib/cn'

interface FavoriteStarButtonProps {
  favorited: boolean
  onToggle: () => void
  disabled?: boolean
  /** When set, renders as a labeled pill (e.g. ReviewStep's "Guardar como favorito") instead of
   *  the default icon-only circular button (e.g. EditEntryModal's header toggle). */
  label?: string
  /** Label shown instead of `label` once `favorited` is true — e.g. "Guardado como favorito". */
  favoritedLabel?: string
  className?: string
  'aria-label'?: string
}

/**
 * Star toggle shared by every "favorite this dish" affordance in the app — filled and tinted
 * once favorited, a plain outline otherwise. Favoriting has no stable link back to a specific
 * saved entry (the API returns a new favorite id, not the entry it came from), so callers track
 * "did I just favorite/unfavorite this" as session-local state rather than a synced server
 * truth — see EditEntryModal and ReviewStep.
 */
export function FavoriteStarButton({
  favorited,
  onToggle,
  disabled,
  label,
  favoritedLabel,
  className,
  ...props
}: FavoriteStarButtonProps) {
  const icon = <Star className={cn(label ? 'size-4' : 'size-5', favorited && 'fill-current')} aria-hidden="true" />

  if (label) {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={favorited}
        className={cn(
          'inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap',
          'transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          favorited ? 'bg-primary-tint text-primary-300' : 'bg-surface-2 text-ink-muted hover:text-ink',
          className,
        )}
      >
        {icon}
        {favorited && favoritedLabel ? favoritedLabel : label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={favorited}
      aria-label={props['aria-label'] ?? (favorited ? 'Quitar de favoritos' : 'Agregar a favoritos')}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        favorited ? 'text-primary-400' : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      {icon}
    </button>
  )
}
