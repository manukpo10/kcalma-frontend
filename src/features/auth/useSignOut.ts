import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { usePushUnsubscribe } from '../reminders/usePushSubscription'

/**
 * Shared "log out" action for a device that might be shared between people: best-effort drops
 * this device's push subscription first (so the outgoing user's reminders stop arriving here),
 * clears the TanStack Query cache, then signs out of Supabase.
 *
 * AuthProvider also clears the query cache itself once the resulting `SIGNED_OUT` event comes
 * back — clearing here too just avoids a brief flash of the outgoing user's cached data on
 * whatever screen is behind this call before that listener runs.
 */
export function useSignOut() {
  const queryClient = useQueryClient()
  const unsubscribePush = usePushUnsubscribe()

  return async () => {
    try {
      await unsubscribePush.mutateAsync()
    } catch {
      // Best-effort, same reasoning as RemindersSection's own disable flow: a stale/already-gone
      // subscription must never block signing out.
    }
    queryClient.clear()
    await supabase.auth.signOut()
  }
}
