import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { DayResponse } from './types'

interface UseDayOptions {
  /** Defaults to true — set false to fetch on demand only (e.g. TodayPage's "yesterday" lookup
   *  for the repeat-meal chips, only needed while viewing today). */
  enabled?: boolean
}

export function useDay(date: string, options: UseDayOptions = {}) {
  return useQuery({
    queryKey: ['day', date],
    queryFn: () => apiFetch<DayResponse>(`/api/day?date=${date}`),
    enabled: options.enabled ?? true,
  })
}
