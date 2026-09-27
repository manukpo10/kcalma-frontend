/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_API_URL?: string
  readonly VITE_TURNSTILE_SITE_KEY?: string
  readonly VITE_SIGNUPS_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
