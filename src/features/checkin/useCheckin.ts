import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { CheckinHistoryEntry, CheckinResponse } from './types'

const CHECKIN_QUERY_KEY = ['checkin'] as const

/**
 * GET /api/checkin — this week's proposal, if any. Sprint 3a: the backend ships this
 * independently and may not have the route yet on a given deploy, so any error (404 not-yet-
 * deployed, 405, 500) must be treated by the caller as "nothing to show" via `isError`, never as
 * a banner/crash — see CheckinCard, which returns null on `isError`.
 */
export function useCheckin() {
  return useQuery({
    queryKey: CHECKIN_QUERY_KEY,
    queryFn: () => apiFetch<CheckinResponse>('/api/checkin'),
  })
}

/** GET /api/checkin/history?limit=12 — used by Progreso's "Ajustes semanales" section only. */
export function useCheckinHistory(limit = 12) {
  return useQuery({
    queryKey: ['checkin', 'history', limit],
    queryFn: () => apiFetch<CheckinHistoryEntry[]>(`/api/checkin/history?limit=${limit}`),
  })
}

/** Shared by both mutations: accepting/dismissing can move today's targets and always affects
 *  the history list, so profile/day/history all need a fresh read after either one. */
function useInvalidateAfterCheckinDecision() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['checkin', 'history'] })
    void queryClient.invalidateQueries({ queryKey: ['profile'] })
    void queryClient.invalidateQueries({ queryKey: ['day'] })
  }
}

/** POST /api/checkin/accept — applies the proposed target. The response is the updated check-in
 *  itself, written straight into the `['checkin']` cache so the Hoy card disappears immediately
 *  instead of waiting on a background refetch. */
export function useAcceptCheckin() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateAfterCheckinDecision()
  return useMutation({
    mutationFn: () => apiFetch<CheckinResponse>('/api/checkin/accept', { method: 'POST' }),
    onSuccess: (data) => {
      queryClient.setQueryData(CHECKIN_QUERY_KEY, data)
      invalidate()
    },
  })
}

/** POST /api/checkin/dismiss — keeps the current target; a new proposal simply reappears next
 *  week, so (per product decision) this has no "Deshacer" — see CheckinCard. */
export function useDismissCheckin() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateAfterCheckinDecision()
  return useMutation({
    mutationFn: () => apiFetch<CheckinResponse>('/api/checkin/dismiss', { method: 'POST' }),
    onSuccess: (data) => {
      queryClient.setQueryData(CHECKIN_QUERY_KEY, data)
      invalidate()
    },
  })
}
