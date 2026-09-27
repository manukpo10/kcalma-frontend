import type { ReactNode } from 'react'
import logoFullWebp from '../../assets/brand/logo-full.webp'

interface AuthLayoutProps {
  /** Accessible page title (visually hidden) — must be distinct per screen, e.g. "Crear cuenta
   *  en Kcalma", not a generic "Kcalma" repeated on every auth page. */
  heading: string
  tagline: string
  children: ReactNode
}

/** Shared centered-card layout for every pre-auth screen (login, sign-up, recuperar,
 *  restablecer): logo + short tagline above the form, safe-area aware. */
export function AuthLayout({ heading, tagline, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-9 flex flex-col items-center text-center">
          <h1 className="sr-only">{heading}</h1>
          <img src={logoFullWebp} alt="Kcalma" className="h-44 w-auto" />
          <p className="mt-1.5 text-sm text-ink-muted">{tagline}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
