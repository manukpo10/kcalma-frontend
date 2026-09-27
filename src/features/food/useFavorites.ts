import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { CreateFavoriteRequest, FavoriteDish } from './types'

/** GET /api/favorites — every saved favorite, newest first (server-ordered). */
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiFetch<FavoriteDish[]>('/api/favorites'),
  })
}

/** POST /api/favorites — from either an existing entry's id (EditEntryModal's star) or a full
 *  dish payload (ReviewStep's "Guardar como favorito"). */
export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateFavoriteRequest) =>
      apiFetch<FavoriteDish>('/api/favorites', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/favorites/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
