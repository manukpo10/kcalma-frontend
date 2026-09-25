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
}
