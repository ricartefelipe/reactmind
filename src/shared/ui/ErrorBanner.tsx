import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

type Props = {
  message: string
  correlationId?: string
  action?: ReactNode
}

export function ErrorBanner({ message, correlationId, action }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!correlationId) return
    await navigator.clipboard.writeText(correlationId)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="error-banner" role="alert" data-testid="error-banner">
      <p className="error-banner__message">{message}</p>
      {correlationId ? (
        <div className="error-banner__correlation">
          <span>
            {t('common.correlationId')}: {correlationId}
          </span>
          <Button type="button" variant="ghost" onClick={() => void handleCopy()}>
            {copied ? t('common.copied') : t('common.copy')}
          </Button>
        </div>
      ) : null}
      {action}
    </div>
  )
}
