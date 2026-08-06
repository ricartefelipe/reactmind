import { http } from '@/shared/http/client'
import type { OnboardingState } from './types'

export function fetchOnboarding() {
  return http.get<OnboardingState>('/me/onboarding')
}
