import type { ComponentProps, ReactNode, Ref } from 'react'
import { useId } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends Omit<ComponentProps<'input'>, 'className'> {
  label?: string
  error?: string
  hint?: string
  /** Leading glyph, e.g. an email or lock icon. */
  leadingIcon?: ReactNode
  /** Trailing slot — a unit label (e.g. "cm") or an action like a password toggle. */
  trailing?: ReactNode
  containerClassName?: string
}

/**
 * Text input primitive. Always renders at 16px+ (see base styles) so iOS never
 * auto-zooms on focus, and is >=44px tall for comfortable tap targets.
 */
export function Input({
  label,
  error,
  hint,
  leadingIcon,
  trailing,
  id,
  containerClassName,
  ref,
  ...props
}: InputProps & { ref?: Ref<HTMLInputElement> }) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3.5 flex text-ink-muted" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(errorId, hintId) || undefined}
          className={cn(
            'h-12 w-full rounded-lg border bg-surface px-4 text-base text-ink placeholder:text-ink-muted/70',
            'transition-colors duration-150 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/40',
            Boolean(leadingIcon) && 'pl-11',
            Boolean(trailing) && 'pr-12',
            error ? 'border-danger focus:border-danger' : 'border-hairline focus:border-primary-500',
          )}
          {...props}
        />
        {trailing && <div className="absolute right-3 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
