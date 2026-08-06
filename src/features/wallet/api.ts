import { http } from '@/shared/http/client'
import { normalizeBalance, normalizeTransactionsPage } from './normalize'
import type { Balance, TransactionFilters, TransactionsPage } from './types'

export async function fetchBalance() {
  return normalizeBalance(await http.get<Partial<Balance>>('/wallet/balance'))
}

export async function fetchTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.type && filters.type !== 'ALL') params.set('type', filters.type)
  if (filters.q) params.set('q', filters.q)
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.pageSize !== undefined) params.set('pageSize', String(filters.pageSize))
  const query = params.toString()
  const raw = await http.get<Partial<TransactionsPage>>(
    `/wallet/transactions${query ? `?${query}` : ''}`,
  )
  return normalizeTransactionsPage(raw, filters.page ?? 1, filters.pageSize ?? 20)
}
