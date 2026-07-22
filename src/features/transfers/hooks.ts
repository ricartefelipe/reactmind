import { useMutation, useQueryClient } from '@tanstack/react-query'
import { walletKeys } from '@/features/wallet/hooks'
import { createPix } from './api'
import type { CreatePixVariables } from './types'

export function useCreatePix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ idempotencyKey, ...body }: CreatePixVariables) =>
      createPix(body, idempotencyKey),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: walletKeys.balance }),
        queryClient.invalidateQueries({
          queryKey: walletKeys.transactions(),
        }),
      ])
    },
  })
}
