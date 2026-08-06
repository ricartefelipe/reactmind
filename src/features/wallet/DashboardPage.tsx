import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { useNotifications } from '@/features/notifications/hooks'
import { useOnboarding } from '@/features/onboarding/hooks'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatCents } from '@/shared/utils/money'
import { BalanceCard } from './components/BalanceCard'
import { OnboardingChecklist } from './components/OnboardingChecklist'
import { useBalance, useRecentTransactions } from './hooks'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const balance = useBalance()
  const onboarding = useOnboarding()
  useNotifications()
  const recent = useRecentTransactions(5)
  const firstName = user?.name?.split(' ')[0]
  const doneCount =
    onboarding.data?.steps.filter((step) => step.done).length ?? 0

  return (
    <section className="wallet-page">
      <div>
        <p className="wallet-page__eyebrow">
          {t('wallet.greeting')}
          {firstName ? `, ${firstName}` : ''}
        </p>
        <h1>{t('app.name')}</h1>
      </div>

      {balance.isPending && <Skeleton lines={4} />}
      {balance.isError && (
        <ErrorBanner
          message={t('common.error')}
          correlationId={
            balance.error instanceof ApiError
              ? balance.error.correlationId
              : undefined
          }
          action={
            <Button type="button" variant="secondary" onClick={() => void balance.refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {balance.data && (
        <BalanceCard
          availableCents={balance.data.availableCents}
          blockedCents={balance.data.blockedCents}
          dailyLimitCents={balance.data.dailyLimitCents}
          dailySpentCents={balance.data.dailySpentCents}
          currency={balance.data.currency}
        />
      )}

      {onboarding.data && (
        <OnboardingChecklist
          steps={onboarding.data.steps}
          completed={onboarding.data.completed}
          doneCount={doneCount}
        />
      )}

      <div>
        <h2>{t('wallet.shortcutsTitle')}</h2>
        <nav className="wallet-shortcuts" aria-label={t('wallet.shortcutsTitle')}>
          <Link to="/transfers/pix">
            <span className="shortcut-icon" aria-hidden="true">
              ↗
            </span>
            {t('nav.transferPix')}
          </Link>
          <Link to="/beneficiaries">
            <span className="shortcut-icon" aria-hidden="true">
              ◎
            </span>
            {t('nav.beneficiaries')}
          </Link>
          <Link to="/transactions">
            <span className="shortcut-icon" aria-hidden="true">
              ≡
            </span>
            {t('nav.transactions')}
          </Link>
        </nav>
      </div>

      <section>
        <h2>{t('wallet.recentTitle')}</h2>
        {recent.isPending && <Skeleton lines={4} />}
        {recent.data && (
          <ul className="transaction-list" data-testid="recent-transactions">
            {recent.data.items.map((tx) => (
              <li key={tx.id}>
                <div>
                  <strong>{tx.description}</strong>
                  <span>{tx.counterparty}</span>
                </div>
                <strong
                  className={
                    tx.type === 'PIX_IN'
                      ? 'transaction-list__credit'
                      : 'transaction-list__debit'
                  }
                >
                  {tx.type === 'PIX_IN' ? '+' : '-'}
                  {formatCents(tx.amountCents, i18n.language)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
