import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { SuggestionRequestBody, SuggestionResponse } from './types'

/** POST /api/suggestions — 3 meal options that fit what's left of today, not saved yet. */
export function useSuggestMeals() {
  return useMutation({
    mutationFn: (body: SuggestionRequestBody) =>
      apiFetch<SuggestionResponse>('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  })
}
