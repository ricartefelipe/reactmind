import { http } from '@/shared/http/client'
import type { Balance, TransactionFilters, TransactionsPage } from './types'

export function fetchBalance() {
  return http.get<Balance>('/wallet/balance')
}

export function fetchTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.type && filters.type !== 'ALL') params.set('type', filters.type)
  if (filters.q) params.set('q', filters.q)
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.pageSize !== undefined) params.set('pageSize', String(filters.pageSize))
  const query = params.toString()
  return http.get<TransactionsPage>(
    `/wallet/transactions${query ? `?${query}` : ''}`,
  )
}
