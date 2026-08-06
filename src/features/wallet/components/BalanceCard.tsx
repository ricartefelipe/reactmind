import { useTranslation } from 'react-i18next'
import { formatCents } from '@/shared/utils/money'

type Props = {
  availableCents: number
  blockedCents: number
  dailyLimitCents: number
  dailySpentCents: number
  currency: string
}

export function BalanceCard({
  availableCents,
  blockedCents,
  dailyLimitCents,
  dailySpentCents,
  currency,
}: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const available = formatCents(availableCents, locale, currency)
  const blocked = formatCents(blockedCents, locale, currency)
  const spent = formatCents(dailySpentCents, locale, currency)
  const limit = formatCents(dailyLimitCents, locale, currency)
  const limitPercent =
    dailyLimitCents <= 0
      ? 0
      : Math.min(100, Math.round((dailySpentCents / dailyLimitCents) * 100))

  return (
    <div className="balance-card" data-testid="balance-card">
      <div className="balance-card__primary">
        <span className="balance-card__label">{t('wallet.balance')}</span>
        <span className="balance-card__value" data-testid="available-balance">
          {available}
        </span>
      </div>
      <div className="balance-card__meta">
        <div>
          <span className="balance-card__meta-label">{t('wallet.blocked')}</span>
          <span data-testid="blocked-balance">{blocked}</span>
        </div>
        <div>
          <span className="balance-card__meta-label">
            {t('wallet.dailySpent')}
          </span>
          <span>{spent}</span>
        </div>
      </div>
      <div className="balance-card__limit" data-testid="daily-limit-bar">
        <div className="balance-card__limit-head">
          <span>{t('wallet.dailyLimit')}</span>
          <span>
            {spent} / {limit}
          </span>
        </div>
        <div
          className="balance-card__track"
          role="progressbar"
          aria-valuenow={limitPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="balance-card__fill"
            style={{ width: `${limitPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
