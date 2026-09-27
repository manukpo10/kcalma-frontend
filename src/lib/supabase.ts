import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    // Sign-up confirmation and password-recovery links redirect back here with the session in
    // the URL hash (#access_token=...) — this must stay on to pick it up. Flow stays implicit
    // (the default — never set flowType: 'pkce'): on iOS the confirmation/recovery link opens in
    // Safari while the installed PWA is a separate storage origin, so a PKCE code verifier
    // stashed by the PWA would never be visible to the tab that completes the exchange.
    detectSessionInUrl: true,
  },
})
