import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Input } from '@/shared/ui/Input'
import { parseReaisToCents } from '@/shared/utils/money'
import { useQrPayloadMutation } from '../hooks'

export function TransferQrSection() {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('10,00')
  const [pixKey, setPixKey] = useState('demo@vuemind.dev')
  const [amountError, setAmountError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const qr = useQrPayloadMutation()

  useEffect(() => {
    if (!qr.data?.payload || !canvasRef.current) return
    void QRCode.toCanvas(canvasRef.current, qr.data.payload, {
      width: 180,
      margin: 1,
    })
  }, [qr.data?.payload])

  function handleGenerate() {
    setAmountError('')
    try {
      const cents = parseReaisToCents(amount)
      if (cents <= 0) throw new Error('INVALID_MONEY')
      qr.mutate({ amountCents: cents, pixKey: pixKey.trim() })
    } catch {
      setAmountError(t('transfers.validation.amount'))
    }
  }

  return (
    <section className="transfer-qr" data-testid="pix-qr-section">
      <h2>{t('transfers.qr.title')}</h2>
      <Input
        id="qr-amount"
        label={t('transfers.qr.amount')}
        value={amount}
        onChange={setAmount}
        error={amountError}
      />
      <Input
        id="qr-key"
        label={t('transfers.qr.pixKey')}
        value={pixKey}
        onChange={setPixKey}
      />
      <Button
        type="button"
        data-testid="pix-qr-generate"
        disabled={qr.isPending}
        onClick={handleGenerate}
      >
        {t('transfers.qr.generate')}
      </Button>
      {qr.isError && (
        <ErrorBanner
          message={
            qr.error instanceof Error ? qr.error.message : t('common.error')
          }
          correlationId={
            qr.error instanceof ApiError ? qr.error.correlationId : undefined
          }
        />
      )}
      {qr.data?.payload && (
        <div className="transfer-qr__result">
          <canvas ref={canvasRef} data-testid="pix-qr-canvas" />
          <p data-testid="pix-qr-payload">
            <strong>{t('transfers.qr.payload')}:</strong> {qr.data.payload}
          </p>
        </div>
      )}
    </section>
  )
}
