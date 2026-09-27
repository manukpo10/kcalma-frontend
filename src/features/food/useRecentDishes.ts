import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { RecentDish } from './types'

const DEFAULT_LIMIT = 20

/** GET /api/food/recent — dishes logged before, most relevant first (server-ordered), for the
 *  "Recientes" picker on the add-meal screen. */
export function useRecentDishes(limit: number = DEFAULT_LIMIT) {
  return useQuery({
    queryKey: ['food-recent', limit],
    queryFn: () => apiFetch<RecentDish[]>(`/api/food/recent?limit=${limit}`),
  })
}
