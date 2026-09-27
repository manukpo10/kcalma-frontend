import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { mapUrlError } from './authErrors'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  /** True from the `PASSWORD_RECOVERY` event until `completePasswordRecovery()` runs. A recovery
   *  link grants a real Supabase session, but the user hasn't set a new password yet — while this
   *  is true, RequireAuth/LoginPage must treat it as "not signed in" so a recovery link can never
   *  be used to browse into the app instead of /restablecer. Backed by sessionStorage (not just
   *  React state) so a page refresh mid-flow doesn't clear the flag and reopen that door. */
  isPasswordRecovery: boolean
  /** Friendly message decoded from a `#error=...` redirect hash (an expired or already-used
   *  confirmation/recovery link) — shown once by LoginPage, then dismissed via
   *  `clearRedirectError`. */
  redirectError: string | null
  clearRedirectError: () => void
  /** Called by ResetPasswordPage right after `updateUser({ password })` succeeds, so the now
   *  fully-authenticated session is treated as a normal sign-in from that point on. */
  completePasswordRecovery: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const RECOVERY_STORAGE_KEY = 'kcalma.auth.recovery'

function readRecoveryFlag(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeRecoveryFlag(value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(RECOVERY_STORAGE_KEY, '1')
    } else {
      sessionStorage.removeItem(RECOVERY_STORAGE_KEY)
    }
  } catch {
    // Safari private mode, storage disabled, etc. — the in-memory state set alongside every call
    // to this still gates access for the current page load, which covers the common case (the
    // recovery link's own tab); only a mid-flow refresh loses the extra protection.
  }
}

/** Parses a `#error=...&error_code=...` redirect hash into friendly copy, without touching
 *  anything the SDK itself reads. Safe to read independently: `@supabase/auth-js` only ever
 *  clears the hash on a *successful* session (see `_getSessionFromURL`), never on this error
 *  path, so nothing races this. */
function readHashError(hash: string): string | null {
  if (!hash.includes('error=')) return null
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.get('error') && !params.get('error_code')) return null
  return mapUrlError(params.get('error_code'))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(readRecoveryFlag)
  // Lazy initializer (not a setState-in-effect) — this only ever needs the hash present at first
  // paint, not something that changes later and needs an effect to "synchronize" with.
  const [redirectError, setRedirectError] = useState<string | null>(() => readHashError(window.location.hash))
  // Tracks whose data is currently cached — not just "is someone signed in" — so a shared device
  // clears TanStack Query's cache whenever the signed-in user actually changes (sign-out included,
  // via a transition to null), without wiping it on e.g. a same-user token refresh.
  const lastUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Only clearing the URL here (no setState) — the error itself was already captured above.
    if (readHashError(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    supabase.auth.getSession().then(({ data }) => {
      lastUserIdRef.current = data.session?.user.id ?? null
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      const newUserId = newSession?.user.id ?? null
      if (newUserId !== lastUserIdRef.current) {
        queryClient.clear()
        lastUserIdRef.current = newUserId
      }

      setSession(newSession)

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
        writeRecoveryFlag(true)
      } else if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        setIsPasswordRecovery(false)
        writeRecoveryFlag(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const clearRedirectError = useCallback(() => setRedirectError(null), [])
  const completePasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false)
    writeRecoveryFlag(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, loading, isPasswordRecovery, redirectError, clearRedirectError, completePasswordRecovery }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
