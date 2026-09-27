import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { ReminderSettings } from './types'

const REMINDERS_QUERY_KEY = ['reminders'] as const
const UPDATE_MUTATION_KEY = ['reminders', 'update'] as const

/**
 * GET /api/reminders. `retry: false` is deliberate: the backend for this sprint deploys
 * independently, so a 404/405/500 here just means "not live yet" rather than a transient
 * failure — `RemindersSection` hides itself entirely while there's no cached data yet (see its
 * CRITICAL deploy note), and retrying would only delay that decision.
 */
export function useReminderSettings() {
  return useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: () => apiFetch<ReminderSettings>('/api/reminders'),
    retry: false,
  })
}

/** PUT /api/reminders with optimistic UI: every toggle/time change in RemindersSection calls
 *  this directly (no separate "save" step), so the UI must reflect it immediately and roll back
 *  if the request fails.
 *
 *  `scope: { id: 'reminders' }` serializes the network calls: if the user changes two settings
 *  before the first PUT resolves, the second's request waits for the first instead of racing it,
 *  so an out-of-order response can never revert a newer edit. `onMutate` still runs synchronously
 *  for every call — only the network request is queued — so the optimistic UI stays instant.
 *
 *  Because calls are serialized, `isMutating({ mutationKey })` inside `onSuccess`/`onError` tells
 *  a callback whether it belongs to the *last* mutation in that queue (it's still `=== 1`, i.e.
 *  pending, while its own callbacks run): earlier ones find later ones still pending and skip
 *  touching the cache, so only the final settled result — or its rollback — ever wins. */
export function useUpdateReminderSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: UPDATE_MUTATION_KEY,
    scope: { id: 'reminders' },
    mutationFn: (settings: ReminderSettings) =>
      apiFetch<ReminderSettings>('/api/reminders', { method: 'PUT', body: JSON.stringify(settings) }),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: REMINDERS_QUERY_KEY })
      const previous = queryClient.getQueryData<ReminderSettings>(REMINDERS_QUERY_KEY)
      queryClient.setQueryData(REMINDERS_QUERY_KEY, next)
      return { previous }
    },
    onSuccess: (data) => {
      if (queryClient.isMutating({ mutationKey: UPDATE_MUTATION_KEY }) === 1) {
        queryClient.setQueryData(REMINDERS_QUERY_KEY, data)
      }
    },
    onError: (_error, _next, context) => {
      if (queryClient.isMutating({ mutationKey: UPDATE_MUTATION_KEY }) === 1) {
        if (context?.previous) queryClient.setQueryData(REMINDERS_QUERY_KEY, context.previous)
        queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY })
      }
    },
  })
}
