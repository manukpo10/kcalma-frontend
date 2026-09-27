import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'
import { Input } from '../../components/ui/Input'

const TIME_PATTERN = /^\d{2}:\d{2}$/

type ReminderTimeInputProps = Omit<ComponentProps<typeof Input>, 'type' | 'value' | 'onChange' | 'onBlur'> & {
  value: string
  onChange: (value: string) => void
}

/**
 * `<input type="time">` for the reminders form, with a local draft that only reaches the parent
 * `onChange` on blur — and only when the draft is a complete, changed "HH:mm".
 *
 * Why: wiring the parent `onChange` straight to the native `input` event fires on every
 * keystroke/wheel-tick, and each one PUTs the whole settings document (see
 * `useUpdateReminderSettings`) and, before this component existed, disabled the field while that
 * request was in flight. On iOS that reportedly closes the time picker on the very first wheel
 * movement, since the field gets disabled mid-gesture; on desktop, typing a time fires once per
 * segment and can briefly send an empty string between segments. Committing on blur removes the
 * field from that loop entirely.
 */
export function ReminderTimeInput({ value, onChange, ...props }: ReminderTimeInputProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const commit = () => {
    if (TIME_PATTERN.test(draft) && draft !== value) {
      onChange(draft)
    } else {
      // Invalid (e.g. cleared mid-edit) or unchanged — snap back to the last known-good value
      // instead of leaving the field stuck on something that was never sent upstream.
      setDraft(value)
    }
  }

  return (
    <Input
      type="time"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      {...props}
    />
  )
}
