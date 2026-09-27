import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { MeasurementEntry, MeasurementRequest } from './types'

/** GET /api/measurements?from&to — only fetched once a range is known (see ProgressPage, which
 *  passes the same from/to the rest of Progreso is already showing). */
export function useMeasurements(from: string | undefined, to: string | undefined) {
  return useQuery({
    queryKey: ['measurements', from, to],
    queryFn: () => apiFetch<MeasurementEntry[]>(`/api/measurements?from=${from}&to=${to}`),
    enabled: Boolean(from && to),
  })
}

/** Shared by both mutations below: a saved body-fat value can move the profile's protein basis
 *  (see NutritionCalculator on the backend), so today's targets/day totals may change too. */
function useInvalidateAfterMeasurementChange() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['measurements'] })
    void queryClient.invalidateQueries({ queryKey: ['profile'] })
    void queryClient.invalidateQueries({ queryKey: ['day'] })
  }
}

/** PUT /api/measurements/{date} — upserts one day's measurements (create or edit, same call). */
export function useUpsertMeasurement() {
  const invalidate = useInvalidateAfterMeasurementChange()
  return useMutation({
    mutationFn: ({ date, ...body }: MeasurementRequest & { date: string }) =>
      apiFetch<MeasurementEntry>(`/api/measurements/${date}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteMeasurement() {
  const invalidate = useInvalidateAfterMeasurementChange()
  return useMutation({
    mutationFn: (date: string) => apiFetch<void>(`/api/measurements/${date}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
