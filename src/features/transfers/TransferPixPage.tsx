import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { useBeneficiaries } from '@/features/beneficiaries/hooks'
import { useBalance } from '@/features/wallet/hooks'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Input } from '@/shared/ui/Input'
import { LoadingBlock } from '@/shared/ui/LoadingBlock'
import { createIdempotencyKey } from '@/shared/utils/id'
import { formatCents, parseReaisToCents } from '@/shared/utils/money'
import { useCreatePix } from './hooks'
import { validatePixAmount } from './pixValidation'

type Step = 'FORM' | 'CONFIRMATION' | 'RECEIPT'

const ERROR_MESSAGES: Record<string, string> = {
  BENEFICIARY_NOT_FOUND: 'Favorecido não encontrado.',
  INVALID_AMOUNT: 'Informe um valor válido para a transferência.',
  INSUFFICIENT_FUNDS: 'Saldo insuficiente para completar a transferência.',
}

function parseAmount(value: string): number | null {
  try {
    return parseReaisToCents(value)
  } catch {
    return null
  }
}

function mutationErrorMessage(error: Error | null): string {
  if (error instanceof ApiError) {
    return (
      ERROR_MESSAGES[error.code] ??
      'Não foi possível concluir a transferência PIX.'
    )
  }
  return 'Não foi possível concluir a transferência PIX.'
}

export function TransferPixPage() {
  const [step, setStep] = useState<Step>('FORM')
  const [beneficiaryId, setBeneficiaryId] = useState('')
  const [amount, setAmount] = useState('')
  const idempotencyKey = useRef<string | null>(null)
  const beneficiaries = useBeneficiaries()
  const balance = useBalance()
  const createPix = useCreatePix()

  const amountCents = parseAmount(amount)
  const validationCode =
    amountCents === null || !balance.data
      ? 'INVALID_AMOUNT'
      : validatePixAmount(amountCents, balance.data.availableCents)
  const selectedBeneficiary = beneficiaries.data?.items.find(
    (beneficiary) => beneficiary.id === beneficiaryId,
  )
  const canContinue =
    selectedBeneficiary !== undefined &&
    validationCode === null &&
    !beneficiaries.isPending &&
    !balance.isPending

  useEffect(() => {
    idempotencyKey.current = null
  }, [beneficiaryId, amountCents])

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canContinue) return
    setStep('CONFIRMATION')
  }

  function handleConfirm() {
    if (amountCents === null || !selectedBeneficiary || createPix.isPending) {
      return
    }

    idempotencyKey.current ??= createIdempotencyKey()
    createPix.mutate(
      {
        beneficiaryId: selectedBeneficiary.id,
        amountCents,
        idempotencyKey: idempotencyKey.current,
      },
      { onSuccess: () => setStep('RECEIPT') },
    )
  }

  function handleBack() {
    createPix.reset()
    setStep('FORM')
  }

  if (step === 'RECEIPT' && createPix.data) {
    return (
      <section className="wallet-page">
        <h1>Comprovante PIX</h1>
        <dl className="transfer-summary">
          <div>
            <dt>Identificador</dt>
            <dd>{createPix.data.id}</dd>
          </div>
          <div>
            <dt>Valor</dt>
            <dd>{formatCents(createPix.data.amountCents)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Concluído</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>
              {new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              }).format(new Date(createPix.data.createdAt))}
            </dd>
          </div>
        </dl>
        <Link className="btn transfer-link" to="/">
          Voltar ao dashboard
        </Link>
      </section>
    )
  }

  if (step === 'CONFIRMATION' && selectedBeneficiary && amountCents !== null) {
    return (
      <section className="wallet-page">
        <h1>Confirmar PIX</h1>
        <dl className="transfer-summary">
          <div>
            <dt>Favorecido</dt>
            <dd>{selectedBeneficiary.name}</dd>
          </div>
          <div>
            <dt>Chave PIX</dt>
            <dd>{selectedBeneficiary.pixKey}</dd>
          </div>
          <div>
            <dt>Valor</dt>
            <dd>{formatCents(amountCents)}</dd>
          </div>
        </dl>
        {createPix.isError && (
          <ErrorBanner message={mutationErrorMessage(createPix.error)} />
        )}
        <div className="transfer-actions">
          <Button type="button" disabled={createPix.isPending} onClick={handleBack}>
            Voltar
          </Button>
          <Button
            type="button"
            disabled={createPix.isPending}
            onClick={handleConfirm}
          >
            {createPix.isPending ? 'Confirmando…' : 'Confirmar PIX'}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="wallet-page">
      <h1>Transferir via PIX</h1>
      {beneficiaries.isPending && (
        <LoadingBlock label="Carregando favorecidos…" />
      )}
      {beneficiaries.isError && (
        <ErrorBanner message="Não foi possível carregar os favorecidos." />
      )}
      {balance.isPending && <LoadingBlock label="Carregando saldo…" />}
      {balance.isError && (
        <ErrorBanner message="Não foi possível carregar o saldo." />
      )}

      <form className="transfer-form" onSubmit={handleContinue}>
        <label className="field" htmlFor="pix-beneficiary">
          <span>Favorecido</span>
          <select
            id="pix-beneficiary"
            value={beneficiaryId}
            onChange={(event) => setBeneficiaryId(event.target.value)}
          >
            <option value="">Selecione um favorecido</option>
            {beneficiaries.data?.items.map((beneficiary) => (
              <option key={beneficiary.id} value={beneficiary.id}>
                {beneficiary.name}
              </option>
            ))}
          </select>
        </label>
        <Input label="Valor" value={amount} onChange={setAmount} />
        <Button type="submit" disabled={!canContinue}>
          Continuar
        </Button>
      </form>
    </section>
  )
}
