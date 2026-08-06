import { useTranslation } from 'react-i18next'
import { useBeneficiaries } from '@/features/beneficiaries/hooks'
import { Button } from '@/shared/ui/Button'
import { formatCents } from '@/shared/utils/money'
import type { CreatePixInput } from '../types'

type Props = {
  draft: CreatePixInput
  loading?: boolean
  hasError?: boolean
  onConfirm: () => void
  onBack: () => void
}

export function TransferConfirm({
  draft,
  loading,
  hasError,
  onConfirm,
  onBack,
}: Props) {
  const { t, i18n } = useTranslation()
  const beneficiaries = useBeneficiaries()
  const destinationLabel = draft.beneficiaryId
    ? (beneficiaries.data?.items.find(
        (item) => item.id === draft.beneficiaryId,
      )?.name ?? draft.beneficiaryId)
    : (draft.pixKey ?? '')
  const whenLabel = draft.scheduledFor
    ? new Date(draft.scheduledFor).toLocaleString(i18n.language)
    : t('transfers.confirm.now')

  return (
    <div className="transfer-step" data-testid="pix-confirm">
      <h2>{t('transfers.steps.confirm')}</h2>
      <p>
        <strong>{t('transfers.confirm.to')}:</strong> {destinationLabel}
      </p>
      <p>
        <strong>{t('transfers.confirm.amount')}:</strong>{' '}
        {formatCents(draft.amountCents, i18n.language)}
      </p>
      <p>
        <strong>{t('transfers.confirm.when')}:</strong> {whenLabel}
      </p>
      <div className="transfer-actions">
        <Button type="button" variant="secondary" disabled={loading} onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          type="button"
          disabled={loading}
          data-testid="pix-confirm-submit"
          onClick={onConfirm}
        >
          {hasError ? t('transfers.confirm.retry') : t('transfers.confirm.submit')}
        </Button>
      </div>
    </div>
  )
}
