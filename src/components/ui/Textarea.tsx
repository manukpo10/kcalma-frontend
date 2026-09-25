import type { ComponentProps, Ref } from 'react'
import { useId } from 'react'
import { cn } from '../../lib/cn'

interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'className'> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

/**
 * Multi-line text input primitive, styled to match {@link Input}. Always renders at 16px+ so
 * iOS never auto-zooms on focus.
 */
export function Textarea({
  label,
  error,
  hint,
  id,
  containerClassName,
  ref,
  rows = 4,
  ...props
}: TextareaProps & { ref?: Ref<HTMLTextAreaElement> }) {
  const autoId = useId()
  const textareaId = id ?? autoId
  const errorId = error ? `${textareaId}-error` : undefined
  const hintId = hint ? `${textareaId}-hint` : undefined

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(errorId, hintId) || undefined}
        className={cn(
          'w-full resize-none rounded-lg border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted/70',
          'transition-colors duration-150 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/40',
          error ? 'border-danger focus:border-danger' : 'border-hairline focus:border-primary-500',
        )}
        {...props}
      />
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
