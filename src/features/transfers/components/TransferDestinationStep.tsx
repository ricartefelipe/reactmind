import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useBeneficiaries } from '@/features/beneficiaries/hooks'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { isValidPixKey, type PixKeyType } from '@/shared/utils/pixKey'
import type { PixDestination } from '../types'

const pixKeyTypes: PixKeyType[] = ['EMAIL', 'CPF', 'PHONE', 'RANDOM']

type Props = {
  onSubmit: (destination: PixDestination) => void
}

export function TransferDestinationStep({ onSubmit }: Props) {
  const { t } = useTranslation()
  const beneficiaries = useBeneficiaries()
  const [beneficiaryId, setBeneficiaryId] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('EMAIL')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const hasBeneficiary = Boolean(beneficiaryId)
    const hasKey = Boolean(pixKey.trim())
    if (hasBeneficiary === hasKey) {
      setError(
        hasBeneficiary
          ? t('transfers.validation.xor')
          : t('transfers.validation.beneficiary'),
      )
      return
    }
    if (hasKey && !isValidPixKey(pixKeyType, pixKey.trim())) {
      setError(t('transfers.validation.pixKey'))
      return
    }
    setError('')
    if (hasBeneficiary) {
      onSubmit({ mode: 'beneficiary', beneficiaryId })
      return
    }
    onSubmit({
      mode: 'key',
      pixKey: pixKey.trim(),
      pixKeyType,
    })
  }

  return (
    <form
      className="transfer-step"
      data-testid="pix-destination"
      onSubmit={handleSubmit}
    >
      <h2>{t('transfers.steps.destination')}</h2>
      <label className="field" htmlFor="pix-beneficiary">
        <span>{t('transfers.form.beneficiary')}</span>
        <select
          id="pix-beneficiary"
          data-testid="pix-beneficiary"
          value={beneficiaryId}
          onChange={(event) => {
            setBeneficiaryId(event.target.value)
            setPixKey('')
          }}
        >
          <option value="">{t('transfers.form.chooseBeneficiary')}</option>
          {beneficiaries.data?.items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — {item.pixKey}
            </option>
          ))}
        </select>
      </label>

      <p className="transfer-step__or">{t('transfers.form.orKey')}</p>

      <label className="field" htmlFor="pix-key-type">
        <span>{t('transfers.form.pixKeyType')}</span>
        <select
          id="pix-key-type"
          value={pixKeyType}
          disabled={Boolean(beneficiaryId)}
          onChange={(event) =>
            setPixKeyType(event.target.value as PixKeyType)
          }
        >
          {pixKeyTypes.map((type) => (
            <option key={type} value={type}>
              {t(`beneficiaries.types.${type}`)}
            </option>
          ))}
        </select>
      </label>

      <Input
        id="pix-key"
        label={t('transfers.form.pixKey')}
        value={pixKey}
        disabled={Boolean(beneficiaryId)}
        onChange={(value) => {
          setPixKey(value)
          setBeneficiaryId('')
        }}
      />

      {error ? <p className="transfer-step__error">{error}</p> : null}
      <Button type="submit" data-testid="pix-destination-continue">
        {t('transfers.form.continue')}
      </Button>
    </form>
  )
}
