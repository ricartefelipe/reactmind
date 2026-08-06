export type Balance = {
  availableCents: number
  blockedCents: number
  dailyLimitCents: number
  dailySpentCents: number
  currency: string
}

export type TransactionType = 'PIX_OUT' | 'PIX_IN' | 'TED'

export type TransactionTypeFilter = TransactionType | 'ALL'

export type Transaction = {
  id: string
  type: TransactionType
  amountCents: number
  description: string
  createdAt: string
  counterparty: string
}

export type TransactionsPage = {
  items: Transaction[]
  page: number
  pageSize: number
  total: number
}

export type TransactionFilters = {
  from?: string
  to?: string
  type?: TransactionTypeFilter
  q?: string
  page?: number
  pageSize?: number
}
