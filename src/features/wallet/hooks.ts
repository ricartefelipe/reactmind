import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { fetchBalance, fetchTransactions } from './api'
import type { TransactionFilters } from './types'

export const walletKeys = {
  balance: ['wallet', 'balance'] as const,
  transactions: (filters: Omit<TransactionFilters, 'page' | 'pageSize'> = {}) =>
    ['wallet', 'transactions', filters] as const,
  recent: ['wallet', 'transactions', 'recent'] as const,
}

export function useBalance() {
  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: fetchBalance,
  })
}

export function useRecentTransactions(pageSize = 5) {
  return useQuery({
    queryKey: walletKeys.recent,
    queryFn: () => fetchTransactions({ page: 1, pageSize }),
  })
}

export function useTransactionsInfinite(
  filters: Omit<TransactionFilters, 'page' | 'pageSize'>,
  pageSize = 20,
) {
  return useInfiniteQuery({
    queryKey: walletKeys.transactions(filters),
    queryFn: ({ pageParam }) =>
      fetchTransactions({ ...filters, page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    },
  })
}
