import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationKeys } from '@/features/notifications/hooks'
import { onboardingKeys } from '@/features/onboarding/hooks'
import { walletKeys } from '@/features/wallet/hooks'
import { createPix, fetchQrPayload, fetchTransfer } from './api'
import type { CreatePixVariables } from './types'

export function useCreatePix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ idempotencyKey, ...body }: CreatePixVariables) =>
      createPix(body, idempotencyKey),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: walletKeys.balance,
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'transactions'],
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({
          queryKey: onboardingKeys.all,
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.all,
          refetchType: 'all',
        }),
      ])
    },
  })
}

export function useTransfer(id: string | undefined) {
  return useQuery({
    queryKey: ['transfers', id],
    queryFn: () => fetchTransfer(id!),
    enabled: Boolean(id),
  })
}

export function useQrPayloadMutation() {
  return useMutation({
    mutationFn: ({
      amountCents,
      pixKey,
    }: {
      amountCents: number
      pixKey: string
    }) => fetchQrPayload(amountCents, pixKey),
  })
}
