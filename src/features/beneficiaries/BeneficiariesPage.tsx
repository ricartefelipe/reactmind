import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Input } from '@/shared/ui/Input'
import { Skeleton } from '@/shared/ui/Skeleton'
import { isValidPixKey, type PixKeyType } from '@/shared/utils/pixKey'
import {
  useBeneficiaries,
  useCreateBeneficiary,
  useDeleteBeneficiary,
} from './hooks'

const pixKeyTypes: PixKeyType[] = ['EMAIL', 'CPF', 'PHONE', 'RANDOM']

export function BeneficiariesPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('EMAIL')
  const [nameError, setNameError] = useState('')
  const [pixKeyError, setPixKeyError] = useState('')
  const beneficiaries = useBeneficiaries()
  const createBeneficiary = useCreateBeneficiary()
  const deleteBeneficiary = useDeleteBeneficiary()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextNameError = name.trim() ? '' : t('beneficiaries.validation.name')
    let nextPixKeyError = ''
    if (!pixKey.trim()) {
      nextPixKeyError = t('beneficiaries.validation.pixKey')
    } else if (!isValidPixKey(pixKeyType, pixKey.trim())) {
      nextPixKeyError = t('beneficiaries.validation.pixKeyInvalid')
    }
    setNameError(nextNameError)
    setPixKeyError(nextPixKeyError)
    if (nextNameError || nextPixKeyError || createBeneficiary.isPending) return

    createBeneficiary.mutate(
      {
        name: name.trim(),
        pixKey: pixKey.trim(),
        pixKeyType,
      },
      {
        onSuccess: () => {
          setName('')
          setPixKey('')
          setPixKeyType('EMAIL')
        },
      },
    )
  }

  return (
    <section className="wallet-page">
      <h1>{t('beneficiaries.title')}</h1>

      <form
        className="beneficiary-form"
        data-testid="beneficiary-form"
        onSubmit={handleSubmit}
      >
        <Input
          id="beneficiary-name"
          label={t('beneficiaries.form.name')}
          value={name}
          onChange={setName}
          error={nameError}
        />
        <label className="field" htmlFor="beneficiary-type">
          <span>{t('beneficiaries.form.pixKeyType')}</span>
          <select
            id="beneficiary-type"
            data-testid="beneficiary-type"
            value={pixKeyType}
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
          id="beneficiary-pix"
          label={t('beneficiaries.form.pixKey')}
          value={pixKey}
          onChange={setPixKey}
          error={pixKeyError}
        />
        <Button
          type="submit"
          data-testid="beneficiary-submit"
          disabled={createBeneficiary.isPending}
        >
          {t('beneficiaries.form.submit')}
        </Button>
      </form>

      {createBeneficiary.isError && (
        <ErrorBanner
          message={
            createBeneficiary.error instanceof Error
              ? createBeneficiary.error.message
              : t('common.error')
          }
          correlationId={
            createBeneficiary.error instanceof ApiError
              ? createBeneficiary.error.correlationId
              : undefined
          }
        />
      )}
      {deleteBeneficiary.isError && (
        <ErrorBanner
          message={
            deleteBeneficiary.error instanceof Error
              ? deleteBeneficiary.error.message
              : t('common.error')
          }
          correlationId={
            deleteBeneficiary.error instanceof ApiError
              ? deleteBeneficiary.error.correlationId
              : undefined
          }
        />
      )}
      {beneficiaries.isPending && <Skeleton lines={4} />}
      {beneficiaries.isError && (
        <ErrorBanner
          message={
            beneficiaries.error instanceof Error
              ? beneficiaries.error.message
              : t('common.error')
          }
          correlationId={
            beneficiaries.error instanceof ApiError
              ? beneficiaries.error.correlationId
              : undefined
          }
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => void beneficiaries.refetch()}
            >
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {beneficiaries.data?.items.length === 0 && (
        <EmptyState
          title={t('beneficiaries.empty.title')}
          description={t('beneficiaries.empty.description')}
        />
      )}
      {beneficiaries.data && beneficiaries.data.items.length > 0 && (
        <ul className="transaction-list" data-testid="beneficiary-list">
          {beneficiaries.data.items.map((beneficiary) => (
            <li key={beneficiary.id}>
              <div>
                <strong>{beneficiary.name}</strong>
                <span>
                  {beneficiary.pixKey} ·{' '}
                  {t(`beneficiaries.types.${beneficiary.pixKeyType}`)}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                aria-label={`${t('beneficiaries.remove')} ${beneficiary.name}`}
                disabled={
                  deleteBeneficiary.isPending &&
                  deleteBeneficiary.variables === beneficiary.id
                }
                onClick={() => deleteBeneficiary.mutate(beneficiary.id)}
              >
                {t('beneficiaries.remove')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
