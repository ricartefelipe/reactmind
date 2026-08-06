import { useQuery } from '@tanstack/react-query'
import { fetchOnboarding } from './api'

export const onboardingKeys = {
  all: ['onboarding'] as const,
}

export function useOnboarding() {
  return useQuery({
    queryKey: onboardingKeys.all,
    queryFn: fetchOnboarding,
  })
}
