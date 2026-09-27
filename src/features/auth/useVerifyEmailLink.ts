import type { EmailOtpType } from '@supabase/supabase-js'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export type VerifyLinkStatus = 'idle' | 'verifying' | 'error'

/**
 * Shared "tap to verify" flow for a Supabase `token_hash` email link (invite or recovery), used
 * by WelcomePage and ResetPasswordPage. `verify()` must only be called from a user gesture (a
 * button tap), never on mount/load: `verifyOtp` is a POST, so a mail scanner that only GETs the
 * link can't burn the single-use token on its own, but gating on tap is the explicit,
 * belt-and-suspenders protection this flow was asked to have against a scanner that also runs JS.
 *
 * On success the caller's `session` (from `useAuth()`) becomes populated once Supabase's own
 * `onAuthStateChange` listener runs, which is what should drive the next screen — this hook's own
 * `status` only tracks the tap-to-verify step itself.
 */
export function useVerifyEmailLink(tokenHash: string | null, type: EmailOtpType) {
  const [status, setStatus] = useState<VerifyLinkStatus>('idle')

  const verify = async (): Promise<boolean> => {
    if (!tokenHash) {
      setStatus('error')
      return false
    }
    setStatus('verifying')
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      setStatus('error')
      return false
    }
    return true
  }

  return { status, verify }
}
