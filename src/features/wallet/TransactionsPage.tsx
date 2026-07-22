import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useTransactions } from './hooks'
import type { TransactionType } from './types'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { LoadingBlock } from '@/shared/ui/LoadingBlock'
import { formatCents } from '@/shared/utils/money'

type TransactionFilter = TransactionType | 'all'

const typeLabels = {
  PIX_OUT: 'PIX enviado',
  PIX_IN: 'PIX recebido',
  TED: 'TED',
} satisfies Record<TransactionType, string>

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function TransactionsPage() {
  const [filter, setFilter] = useState<TransactionFilter>('all')
  const type = filter === 'all' ? undefined : filter
  const transactions = useTransactions(type)

  function handleFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    setFilter(event.target.value as TransactionFilter)
  }

  return (
    <section className="wallet-page">
      <div className="transactions-header">
        <h1>Extrato</h1>
        <label className="transaction-filter">
          Tipo
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">Todos</option>
            <option value="PIX_OUT">PIX enviado</option>
            <option value="PIX_IN">PIX recebido</option>
            <option value="TED">TED</option>
          </select>
        </label>
      </div>

      {transactions.isPending && (
        <LoadingBlock label="Carregando transações…" />
      )}
      {transactions.isError && (
        <ErrorBanner message="Não foi possível carregar o extrato." />
      )}
      {transactions.data?.items.length === 0 && (
        <EmptyState message="Nenhuma transação encontrada." />
      )}
      {transactions.data && transactions.data.items.length > 0 && (
        <ul className="transaction-list">
          {transactions.data.items.map((transaction) => (
            <li key={transaction.id}>
              <div>
                <strong>{transaction.counterparty}</strong>
                <span>{transaction.description}</span>
                <time dateTime={transaction.createdAt}>
                  {formatDate(transaction.createdAt)}
                </time>
              </div>
              <div className="transaction-list__amount">
                <span>{typeLabels[transaction.type]}</span>
                <strong>{formatCents(transaction.amountCents)}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
