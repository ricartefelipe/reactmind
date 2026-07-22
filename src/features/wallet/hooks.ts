import { useQuery } from '@tanstack/react-query'
import { fetchBalance, fetchTransactions } from './api'
import type { TransactionType } from './types'

export const walletKeys = {
  balance: ['wallet', 'balance'] as const,
  transactions: (type?: TransactionType) =>
    ['wallet', 'transactions', type ?? 'all'] as const,
}

export function useBalance() {
  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: fetchBalance,
  })
}

export function useTransactions(type?: TransactionType) {
  return useQuery({
    queryKey: walletKeys.transactions(type),
    queryFn: () => fetchTransactions(type),
  })
}
