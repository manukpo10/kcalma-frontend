/**
 * Best-effort Spanish, user-safe translation of a Supabase Auth error — shared by every auth
 * screen (login, sign-up, recuperar, restablecer) instead of each mapping strings on its own.
 *
 * Keyed primarily by the stable `error.code` GoTrue returns (see `@supabase/auth-js`'s
 * `ErrorCode` union: 'signup_disabled' | 'email_address_not_authorized' | 'weak_password' | ...),
 * falling back to matching `error.message` for older/uncoded errors — the SDK's own docs note the
 * server can return codes older client versions don't know about.
 */
export function mapAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Ocurrió un error inesperado.'
  }

  const code = (error as { code?: string }).code
  switch (code) {
    case 'signup_disabled':
      return 'Todavía no se pueden crear cuentas nuevas.'
    case 'email_address_not_authorized':
      return 'No pudimos enviar el mail de confirmación. Avisale al administrador.'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Demasiados intentos. Esperá un momento e intentá de nuevo.'
    case 'weak_password':
      return 'Esa contraseña es muy débil. Probá con una combinación más segura.'
    case 'captcha_failed':
      return 'No pudimos verificar que sos una persona. Intentá de nuevo.'
    case 'email_not_confirmed':
      return 'Es necesario confirmar el correo electrónico antes de iniciar sesión.'
    case 'invalid_credentials':
      return 'El correo electrónico o la contraseña son incorrectos.'
    default:
      break
  }

  // Fallback for servers/errors without a `code` — same checks the app already relied on before
  // this module existed, kept case-insensitive and message-based.
  const message = error.message.toLowerCase()
  if (message.includes('invalid login credentials')) {
    return 'El correo electrónico o la contraseña son incorrectos.'
  }
  if (message.includes('email not confirmed')) {
    return 'Es necesario confirmar el correo electrónico antes de iniciar sesión.'
  }
  if (message.includes('signups not allowed') || message.includes('signup is disabled')) {
    return 'Todavía no se pueden crear cuentas nuevas.'
  }
  if (message.includes('email address') && message.includes('not authorized')) {
    return 'No pudimos enviar el mail de confirmación. Avisale al administrador.'
  }
  if (message.includes('rate limit')) {
    return 'Demasiados intentos. Esperá un momento e intentá de nuevo.'
  }
  if (message.includes('password') && /weak|should contain|should be at least/.test(message)) {
    return 'Esa contraseña es muy débil. Probá con una combinación más segura.'
  }
  if (message.includes('captcha')) {
    return 'No pudimos verificar que sos una persona. Intentá de nuevo.'
  }

  return error.message
}

/** Whether a login failure is specifically "email not confirmed" — LoginPage uses this to show a
 *  "Reenviar mail" action next to the mapped message above. */
export function isEmailNotConfirmedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if ((error as { code?: string }).code === 'email_not_confirmed') return true
  return error.message.toLowerCase().includes('email not confirmed')
}

/** Friendly copy for the `#error=...&error_code=...` redirect hash Supabase appends to an
 *  expired or already-used confirmation/recovery link — see AuthProvider, which parses this once
 *  on mount (it never collides with the SDK's own hash handling: that only ever clears the hash
 *  on a *successful* session — see `_getSessionFromURL` in `@supabase/auth-js`). */
export function mapUrlError(errorCode: string | null): string {
  if (errorCode === 'otp_expired') {
    return 'El enlace venció o ya se usó.'
  }
  return 'No pudimos validar el enlace. Probá de nuevo.'
}
