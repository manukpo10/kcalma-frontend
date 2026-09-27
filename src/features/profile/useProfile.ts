import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiNotFoundError } from '../../lib/api'
import type { Goal, ProfileRequest, ProfileWithTargets } from './types'

const PROFILE_QUERY_KEY = ['profile'] as const

/** Sprint 2a renamed/replaced some goal values — remap whatever an old backend deploy still
 *  returns so onboarding and the profile page never see a value outside the current `Goal` union.
 *  Safe to remove once the backend rollout for this sprint has fully landed. */
const LEGACY_GOAL_MAP: Record<string, Goal> = {
  LOSE: 'LOSE_WEIGHT',
  GAIN: 'GAIN_WEIGHT',
}

function normalizeProfile(data: ProfileWithTargets): ProfileWithTargets {
  const goal = LEGACY_GOAL_MAP[data.profile.goal] ?? data.profile.goal
  if (goal === data.profile.goal) return data
  return { ...data, profile: { ...data.profile, goal } }
}

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => normalizeProfile(await apiFetch<ProfileWithTargets>('/api/profile')),
    retry: (failureCount, error) => {
      if (error instanceof ApiNotFoundError) return false
      return failureCount < 2
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ProfileRequest) =>
      normalizeProfile(
        await apiFetch<ProfileWithTargets>('/api/profile', {
          method: 'PUT',
          body: JSON.stringify(values),
        }),
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data)
      // goalWeightKg lives on the profile but is read by the Progreso summary card — keep it in sync.
      void queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}
