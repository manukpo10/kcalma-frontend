import { useEffect, useRef } from 'react'
import { loadTurnstileScript } from '../lib/turnstile'

interface TurnstileWidgetProps {
  siteKey: string
  onVerify: (token: string) => void
}

/**
 * Cloudflare Turnstile widget — only ever rendered when `VITE_TURNSTILE_SITE_KEY` is set (see
 * LoginPage/SignUpPage/ForgotPasswordPage). Single-use: the token is meant for one submit
 * attempt, so callers remount this with a fresh `key` after each attempt instead of this
 * component exposing an imperative reset — that keeps the reset logic in one place (plain
 * `useState`) rather than a ref-based API.
 */
export function TurnstileWidget({ siteKey, onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let widgetId: string | undefined
    let cancelled = false

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return
        widgetId = turnstile.render(containerRef.current, { sitekey: siteKey, callback: onVerify })
      })
      .catch(() => {
        // Swallowed on purpose: a captcha that fails to load shouldn't block the rest of the
        // form — the backend/Supabase side still rejects the submit if a token was required and
        // never arrived, surfaced through the normal auth-error banner.
      })

    return () => {
      cancelled = true
      if (widgetId !== undefined) {
        loadTurnstileScript()
          .then((turnstile) => turnstile.remove(widgetId!))
          .catch(() => {})
      }
    }
  }, [siteKey, onVerify])

  return <div ref={containerRef} className="flex justify-center" />
}
