import type { ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '../../lib/cn'

interface CheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** Rich label content — e.g. a sentence with an inline <Link>, like the privacy-policy
   *  checkbox on /registro. */
  label: ReactNode
  error?: string
  className?: string
}

/**
 * Single checkbox + label row, native `<input type="checkbox">` under the hood (no dependency).
 * The whole row (box + text) sits inside one `<label>` so the tap target is generous, matching
 * `Switch`'s "whole row is the control" approach.
 */
export function Checkbox({ id, checked, onChange, label, error, className }: CheckboxProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-center gap-3 py-2.5 select-none"
      >
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'size-5 shrink-0 rounded border-hairline bg-surface accent-primary-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
          )}
        />
        <span className="text-sm text-ink">{label}</span>
      </label>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
