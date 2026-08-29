import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { parseReaisToCents } from '@/shared/utils/money'

type Props = Readonly<{
  onSubmit: (amountCents: number) => void
  onBack: () => void
}>

export function TransferAmountStep({ onSubmit, onBack }: Props) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setAmountError('')
    try {
      const cents = parseReaisToCents(amount)
      if (cents <= 0) throw new Error('INVALID_MONEY')
      onSubmit(cents)
    } catch {
      setAmountError(t('transfers.validation.amount'))
    }
  }

  return (
    <form
      className="transfer-step"
      data-testid="pix-amount"
      onSubmit={handleSubmit}
    >
      <h2>{t('transfers.steps.amount')}</h2>
      <Input
        id="pix-amount"
        label={t('transfers.form.amount')}
        value={amount}
        onChange={setAmount}
        error={amountError}
      />
      <div className="transfer-actions">
        <Button type="button" variant="secondary" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button type="submit" data-testid="pix-amount-continue">
          {t('transfers.form.continue')}
        </Button>
      </div>
    </form>
  )
}
