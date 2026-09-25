import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiNotFoundError } from '../../lib/api'
import type { ProfileRequest, ProfileWithTargets } from './types'

const PROFILE_QUERY_KEY = ['profile'] as const

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => apiFetch<ProfileWithTargets>('/api/profile'),
    retry: (failureCount, error) => {
      if (error instanceof ApiNotFoundError) return false
      return failureCount < 2
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ProfileRequest) =>
      apiFetch<ProfileWithTargets>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data)
      // goalWeightKg lives on the profile but is read by the Progreso summary card — keep it in sync.
      void queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}
