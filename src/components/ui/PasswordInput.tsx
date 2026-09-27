import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState, type ComponentProps, type Ref } from 'react'
import { Input } from './Input'

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type' | 'leadingIcon' | 'trailing'> & {
  ref?: Ref<HTMLInputElement>
}

/**
 * `Input` variant shared by every auth form (login, sign-up, restablecer): a lock icon and a
 * show/hide toggle, factored out once instead of re-implementing the toggle state in each page.
 */
export function PasswordInput({ ref, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      leadingIcon={<Lock className="size-5" aria-hidden="true" />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((show) => !show)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      }
      {...props}
    />
  )
}
