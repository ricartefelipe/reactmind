import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useBeneficiaries } from '@/features/beneficiaries/hooks'
import { Button } from '@/shared/ui/Button'
import { formatCents } from '@/shared/utils/money'
import type { PixTransfer } from '../types'

type Props = Readonly<{
  receipt: PixTransfer
  onAgain: () => void
}>

export function TransferReceipt({ receipt, onAgain }: Props) {
  const { t, i18n } = useTranslation()
  const beneficiaries = useBeneficiaries()
  const destinationLabel = receipt.beneficiaryId
    ? (beneficiaries.data?.items.find(
        (item) => item.id === receipt.beneficiaryId,
      )?.name ?? receipt.beneficiaryId)
    : (receipt.pixKey ?? '')

  return (
    <div className="transfer-step" data-testid="pix-receipt">
      <h2>{t('transfers.receipt.title')}</h2>
      <p>
        <strong>{t('transfers.receipt.id')}:</strong> {receipt.id}
      </p>
      <p>
        <strong>{t('transfers.confirm.to')}:</strong> {destinationLabel}
      </p>
      <p>
        <strong>{t('transfers.confirm.amount')}:</strong>{' '}
        {formatCents(receipt.amountCents, i18n.language)}
      </p>
      <p>
        <strong>{t('transfers.receipt.status')}:</strong>{' '}
        {t(`transfers.status.${receipt.status}`)}
      </p>
      <p>
        <strong>{t('transfers.receipt.endToEnd')}:</strong>{' '}
        <span data-testid="pix-end-to-end">{receipt.endToEndId}</span>
      </p>
      <p>
        <strong>{t('transfers.receipt.when')}:</strong>{' '}
        {new Date(receipt.createdAt).toLocaleString(i18n.language)}
      </p>
      {receipt.scheduledFor ? (
        <p>
          <strong>{t('transfers.receipt.scheduledFor')}:</strong>{' '}
          {new Date(receipt.scheduledFor).toLocaleString(i18n.language)}
        </p>
      ) : null}
      <p>
        <strong>{t('transfers.receipt.correlationId')}:</strong>{' '}
        {receipt.correlationId}
      </p>
      <div className="transfer-actions">
        <Button type="button" variant="secondary" onClick={onAgain}>
          {t('transfers.receipt.again')}
        </Button>
        <Link className="btn btn--primary transfer-link" to="/transactions">
          {t('nav.transactions')}
        </Link>
      </div>
    </div>
  )
}
