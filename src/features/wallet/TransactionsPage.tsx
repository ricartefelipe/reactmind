import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { onboardingKeys } from '@/features/onboarding/hooks'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatCents } from '@/shared/utils/money'
import { useTransactionsInfinite } from './hooks'
import type { TransactionTypeFilter } from './types'

const typeOptions: TransactionTypeFilter[] = ['ALL', 'PIX_OUT', 'PIX_IN', 'TED']

export function TransactionsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState<TransactionTypeFilter>('ALL')
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState({
    from: '',
    to: '',
    type: 'ALL' as TransactionTypeFilter,
    q: '',
  })

  const filters = useMemo(
    () => ({
      from: applied.from || undefined,
      to: applied.to || undefined,
      type: applied.type,
      q: applied.q || undefined,
    }),
    [applied],
  )

  const transactions = useTransactionsInfinite(filters)

  useEffect(() => {
    if (transactions.isSuccess) {
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.all })
    }
  }, [transactions.isSuccess, transactions.dataUpdatedAt, queryClient])

  function handleFilter(event: FormEvent) {
    event.preventDefault()
    setApplied({ from, to, type, q })
  }

  const items =
    transactions.data?.pages.flatMap((page) => page.items) ?? []

  return (
    <section className="wallet-page">
      <h1>{t('wallet.transactions')}</h1>

      <form className="transactions-filters" onSubmit={handleFilter}>
        <label className="field">
          <span>{t('wallet.filters.from')}</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="field">
          <span>{t('wallet.filters.to')}</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="field">
          <span>{t('wallet.filters.type')}</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TransactionTypeFilter)}
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {t(`wallet.types.${option}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field transactions-filters__grow">
          <span>{t('wallet.filters.q')}</span>
          <input
            type="search"
            data-testid="transactions-search"
            placeholder={t('wallet.search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <Button type="submit">{t('wallet.filters.apply')}</Button>
      </form>

      {transactions.isPending && <Skeleton lines={5} />}
      {transactions.isError && (
        <ErrorBanner
          message={
            transactions.error instanceof Error
              ? transactions.error.message
              : t('common.error')
          }
          correlationId={
            transactions.error instanceof ApiError
              ? transactions.error.correlationId
              : undefined
          }
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => void transactions.refetch()}
            >
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {!transactions.isPending &&
        !transactions.isError &&
        items.length === 0 && (
          <EmptyState
            title={t('wallet.empty.title')}
            description={t('wallet.empty.description')}
          />
        )}
      {items.length > 0 && (
        <>
          <ul className="transaction-list" data-testid="transactions-list">
            {items.map((transaction) => (
              <li key={transaction.id}>
                <div>
                  <strong>{transaction.description}</strong>
                  <span>
                    {transaction.counterparty} ·{' '}
                    {new Intl.DateTimeFormat(i18n.language).format(
                      new Date(transaction.createdAt),
                    )}
                  </span>
                </div>
                <strong
                  className={
                    transaction.type === 'PIX_IN'
                      ? 'transaction-list__credit'
                      : 'transaction-list__debit'
                  }
                >
                  {transaction.type === 'PIX_IN' ? '+' : '-'}
                  {formatCents(transaction.amountCents, i18n.language)}
                </strong>
              </li>
            ))}
          </ul>
          {transactions.hasNextPage && (
            <Button
              type="button"
              variant="secondary"
              data-testid="transactions-load-more"
              disabled={transactions.isFetchingNextPage}
              onClick={() => void transactions.fetchNextPage()}
            >
              {t('wallet.loadMore')}
            </Button>
          )}
        </>
      )}
    </section>
  )
}
