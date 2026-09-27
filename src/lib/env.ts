function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required env var ${key}. Copy frontend/env.example to .env.local and fill it in.`,
    )
  }
  return value
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: required(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  // Optional: Cloudflare Turnstile site key. Unset in every environment until configured —
  // every auth form treats its absence as "no captcha" and changes nothing (see TurnstileWidget).
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  // Kcalma runs by invitation (the admin invites from the Supabase dashboard) — public
  // registration is closed unless this is explicitly set to the string "true". LoginPage hides
  // "Crear cuenta" and SignUpPage shows a closed-registration message while this is false.
  signupsEnabled: import.meta.env.VITE_SIGNUPS_ENABLED === 'true',
}
