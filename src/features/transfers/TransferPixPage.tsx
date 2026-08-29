import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/shared/http/errors'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { createIdempotencyKey } from '@/shared/utils/id'
import { TransferAmountStep } from './components/TransferAmountStep'
import { TransferConfirm } from './components/TransferConfirm'
import { TransferDestinationStep } from './components/TransferDestinationStep'
import { TransferQrSection } from './components/TransferQrSection'
import { TransferReceipt } from './components/TransferReceipt'
import { TransferScheduleStep } from './components/TransferScheduleStep'
import { useCreatePix } from './hooks'
import type {
  CreatePixInput,
  PixDestination,
  PixTransfer,
  TransferStep,
} from './types'

function draftFrom(
  destination: PixDestination,
  amountCents: number,
  scheduledFor?: string,
): CreatePixInput {
  if (destination.mode === 'beneficiary') {
    return {
      amountCents,
      beneficiaryId: destination.beneficiaryId,
      scheduledFor,
    }
  }
  return {
    amountCents,
    pixKey: destination.pixKey,
    pixKeyType: destination.pixKeyType,
    scheduledFor,
  }
}

export function TransferPixPage() {
  const { t } = useTranslation()
  const createPix = useCreatePix()
  const idempotencyKey = useRef<string | null>(null)
  const [step, setStep] = useState<TransferStep>('destination')
  const [destination, setDestination] = useState<PixDestination | null>(null)
  const [amountCents, setAmountCents] = useState<number | null>(null)
  const [scheduledFor, setScheduledFor] = useState<string | undefined>()
  const [receipt, setReceipt] = useState<PixTransfer | null>(null)

  function reset() {
    createPix.reset()
    idempotencyKey.current = null
    setStep('destination')
    setDestination(null)
    setAmountCents(null)
    setScheduledFor(undefined)
    setReceipt(null)
  }

  function goToConfirm(nextSchedule?: string) {
    setScheduledFor(nextSchedule)
    idempotencyKey.current ??= createIdempotencyKey()
    createPix.reset()
    setStep('confirm')
  }

  function handleConfirm() {
    if (!destination || amountCents === null || createPix.isPending) return
    idempotencyKey.current ??= createIdempotencyKey()
    const body = draftFrom(destination, amountCents, scheduledFor)
    createPix.mutate(
      { ...body, idempotencyKey: idempotencyKey.current },
      {
        onSuccess: (data) => {
          setReceipt(data)
          setStep('receipt')
        },
      },
    )
  }

  function errorMessage(): string {
    const err = createPix.error
    if (err instanceof ApiError) {
      switch (err.code) {
        case 'INSUFFICIENT_FUNDS':
          return t('transfers.errors.insufficientFunds')
        case 'DAILY_LIMIT_EXCEEDED':
          return t('transfers.errors.dailyLimitExceeded')
        case 'INVALID_PIX_KEY':
          return t('transfers.errors.invalidPixKey')
        default:
          return err.message || t('common.error')
      }
    }
    return err?.message || t('common.error')
  }

  const draft =
    destination && amountCents !== null
      ? draftFrom(destination, amountCents, scheduledFor)
      : null

  return (
    <section className="wallet-page">
      <h1>{t('transfers.pix')}</h1>

      {createPix.isError && step === 'confirm' && (
        <ErrorBanner
          message={errorMessage()}
          correlationId={
            createPix.error instanceof ApiError
              ? createPix.error.correlationId
              : undefined
          }
        />
      )}

      {step === 'destination' && (
        <>
          <TransferDestinationStep
            onSubmit={(value) => {
              setDestination(value)
              setStep('amount')
            }}
          />
          <TransferQrSection />
        </>
      )}

      {step === 'amount' && (
        <TransferAmountStep
          onSubmit={(value) => {
            setAmountCents(value)
            setStep('schedule')
          }}
          onBack={() => setStep('destination')}
        />
      )}

      {step === 'schedule' && (
        <TransferScheduleStep
          onSkip={() => goToConfirm()}
          onSubmit={(iso) => goToConfirm(iso)}
          onBack={() => setStep('amount')}
        />
      )}

      {step === 'confirm' && draft && (
        <TransferConfirm
          draft={draft}
          loading={createPix.isPending}
          hasError={createPix.isError}
          onConfirm={handleConfirm}
          onBack={() => {
            createPix.reset()
            setStep('schedule')
          }}
        />
      )}

      {step === 'receipt' && receipt && (
        <TransferReceipt receipt={receipt} onAgain={reset} />
      )}
    </section>
  )
}
