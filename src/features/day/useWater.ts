import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { DayResponse } from './types'

interface AddWaterInput {
  date: string
  deltaMl: number
}

interface WaterResponse {
  date: string
  totalMl: number
  targetMl: number
}

/**
 * POST /api/water — logs a water change for one day. Optimistic on `['day', date]` so
 * WaterCard's total/bar move the instant a button is tapped; rolled back automatically if the
 * request fails, then reconciled with the server's own total on settle (in case it clamps
 * differently than the client's `Math.max(0, ...)` guess).
 */
export function useAddWater() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ date, deltaMl }: AddWaterInput) =>
      apiFetch<WaterResponse>('/api/water', {
        method: 'POST',
        body: JSON.stringify({ date, deltaMl }),
      }),
    onMutate: async ({ date, deltaMl }) => {
      await queryClient.cancelQueries({ queryKey: ['day', date] })
      const previous = queryClient.getQueryData<DayResponse>(['day', date])
      if (previous) {
        queryClient.setQueryData<DayResponse>(['day', date], {
          ...previous,
          water: { ...previous.water, consumedMl: Math.max(0, previous.water.consumedMl + deltaMl) },
        })
      }
      return { previous }
    },
    onError: (_error, { date }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['day', date], context.previous)
      }
    },
    onSettled: (_data, _error, { date }) => {
      void queryClient.invalidateQueries({ queryKey: ['day', date] })
    },
  })
}
