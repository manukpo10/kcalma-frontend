import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { FoodAnalysisResponse, FoodEntry, FoodEntryRequest, MealType, UpdateFoodEntryRequest } from './types'

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

/** POST /api/food/analyze-text — detects items from a free-text description, not saved yet. */
export function useAnalyzeDescription() {
  return useMutation({
    mutationFn: (description: string) =>
      apiFetch<FoodAnalysisResponse>('/api/food/analyze-text', {
        method: 'POST',
        body: JSON.stringify({ description }),
      }),
  })
}

/** Shared by every mutation below that changes what's logged: the day's totals AND the
 *  "Recientes" aggregates (timesLogged/lastLoggedOn) can both move. */
function useInvalidateAfterEntriesChange() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['day'] })
    void queryClient.invalidateQueries({ queryKey: ['food-recent'] })
  }
}

/** POST /api/food/entries — batch-saves confirmed items (from a photo, manual add, or a picked
 *  recent/favorite dish). */
export function useSaveFoodEntries() {
  const invalidate = useInvalidateAfterEntriesChange()
  return useMutation({
    mutationFn: (entries: FoodEntryRequest[]) =>
      apiFetch<FoodEntry[]>('/api/food/entries', {
        method: 'POST',
        body: JSON.stringify({ entries }),
      }),
    onSuccess: invalidate,
  })
}

export function useUpdateFoodEntry() {
  const invalidate = useInvalidateAfterEntriesChange()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateFoodEntryRequest & { id: string }) =>
      apiFetch<FoodEntry>(`/api/food/entries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteFoodEntry() {
  const invalidate = useInvalidateAfterEntriesChange()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/food/entries/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}

/** DELETE /api/food/entries?date&mealType — wipes every entry of one meal/day in one request. */
export function useDeleteMeal() {
  const invalidate = useInvalidateAfterEntriesChange()
  return useMutation({
    mutationFn: ({ date, mealType }: { date: string; mealType: MealType }) =>
      apiFetch<void>(`/api/food/entries?date=${date}&mealType=${mealType}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}

/** POST /api/food/entries/copy — clones one meal/day's entries onto another day (used by "Hoy"'s
 *  "Repetir {comida} de ayer" chip). 400s with a `message` when the source meal was empty. */
export function useCopyMeal() {
  const invalidate = useInvalidateAfterEntriesChange()
  return useMutation({
    mutationFn: ({ fromDate, toDate, mealType }: { fromDate: string; toDate: string; mealType: MealType }) =>
      apiFetch<FoodEntry[]>('/api/food/entries/copy', {
        method: 'POST',
        body: JSON.stringify({ fromDate, toDate, mealType }),
      }),
    onSuccess: invalidate,
  })
}
