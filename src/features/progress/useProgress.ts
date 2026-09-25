import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { ProgressRangeKey, ProgressResponse, UpsertWeightResponse } from './types'

export function useProgress(range: ProgressRangeKey) {
  return useQuery({
    queryKey: ['progress', range],
    queryFn: () => apiFetch<ProgressResponse>(`/api/progress?range=${range}`),
  })
}

/** Shared by every weight mutation: a weigh-in can move the day's targets and the trend charts alike. */
function useInvalidateAfterWeightChange() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['progress'] })
    void queryClient.invalidateQueries({ queryKey: ['day'] })
    void queryClient.invalidateQueries({ queryKey: ['profile'] })
  }
}

/** PUT /api/weights/{date} — upserts one day's weigh-in (create or edit, same call). */
export function useUpsertWeight() {
  const invalidate = useInvalidateAfterWeightChange()
  return useMutation({
    mutationFn: ({ date, weightKg }: { date: string; weightKg: number }) =>
      apiFetch<UpsertWeightResponse>(`/api/weights/${date}`, {
        method: 'PUT',
        body: JSON.stringify({ weightKg }),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteWeight() {
  const invalidate = useInvalidateAfterWeightChange()
  return useMutation({
    mutationFn: (date: string) => apiFetch<void>(`/api/weights/${date}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
