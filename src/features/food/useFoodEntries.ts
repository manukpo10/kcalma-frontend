import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { FoodAnalysisResponse, FoodEntry, FoodEntryRequest, UpdateFoodEntryRequest } from './types'

/** POST /api/food/analyze — detects items from a plate photo, not saved yet. */
export function useAnalyzePhoto() {
  return useMutation({
    mutationFn: (image: Blob) => {
      const form = new FormData()
      form.append('image', image, 'photo.jpg')
      return apiFetch<FoodAnalysisResponse>('/api/food/analyze', { method: 'POST', body: form })
    },
  })
}

/** POST /api/food/entries — batch-saves confirmed items (from a photo or manual add). */
export function useSaveFoodEntries() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entries: FoodEntryRequest[]) =>
      apiFetch<FoodEntry[]>('/api/food/entries', {
        method: 'POST',
        body: JSON.stringify({ entries }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['day'] })
    },
  })
}

export function useUpdateFoodEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateFoodEntryRequest & { id: string }) =>
      apiFetch<FoodEntry>(`/api/food/entries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['day'] })
    },
  })
}

export function useDeleteFoodEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/food/entries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['day'] })
    },
  })
}
