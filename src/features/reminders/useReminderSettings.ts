import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { ReminderSettings } from './types'

const REMINDERS_QUERY_KEY = ['reminders'] as const

/**
 * GET /api/reminders. `retry: false` is deliberate: the backend for this sprint deploys
 * independently, so a 404/405/500 here just means "not live yet" rather than a transient
 * failure — `RemindersSection` hides itself entirely on any error (see its CRITICAL deploy
 * note), and retrying would only delay that decision.
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
 *  if the request fails. */
export function useUpdateReminderSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: ReminderSettings) =>
      apiFetch<ReminderSettings>('/api/reminders', { method: 'PUT', body: JSON.stringify(settings) }),
    onMutate: async (next) => {
      const previous = queryClient.getQueryData<ReminderSettings>(REMINDERS_QUERY_KEY)
      queryClient.setQueryData(REMINDERS_QUERY_KEY, next)
      return { previous }
    },
    onError: (_error, _next, context) => {
      if (context?.previous) queryClient.setQueryData(REMINDERS_QUERY_KEY, context.previous)
    },
    onSuccess: (data) => queryClient.setQueryData(REMINDERS_QUERY_KEY, data),
  })
}
