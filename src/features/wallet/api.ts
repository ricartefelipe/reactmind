import { http } from '@/shared/http/client'
import type { Balance, Transaction, TransactionType } from './types'

export function fetchBalance() {
  return http.get<Balance>('/wallet/balance')
}

export function fetchTransactions(type?: TransactionType) {
  const query = type ? `?type=${encodeURIComponent(type)}` : ''
  return http.get<{ items: Transaction[] }>(`/wallet/transactions${query}`)
}
