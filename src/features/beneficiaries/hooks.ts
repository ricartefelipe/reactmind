import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { onboardingKeys } from '@/features/onboarding/hooks'
import {
  createBeneficiary,
  deleteBeneficiary,
  fetchBeneficiaries,
} from './api'

export const beneficiaryKeys = {
  all: ['beneficiaries'] as const,
}

export function useBeneficiaries() {
  return useQuery({
    queryKey: beneficiaryKeys.all,
    queryFn: fetchBeneficiaries,
  })
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBeneficiary,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: beneficiaryKeys.all }),
        queryClient.invalidateQueries({ queryKey: onboardingKeys.all }),
      ])
    },
  })
}

export function useDeleteBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBeneficiary,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: beneficiaryKeys.all }),
  })
}
