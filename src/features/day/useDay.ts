import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { DayResponse } from './types'

export function useDay(date: string) {
  return useQuery({
    queryKey: ['day', date],
    queryFn: () => apiFetch<DayResponse>(`/api/day?date=${date}`),
  })
}
