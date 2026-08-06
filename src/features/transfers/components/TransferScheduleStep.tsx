import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/Button'

type Props = {
  onSkip: () => void
  onSubmit: (iso: string) => void
  onBack: () => void
}

export function TransferScheduleStep({ onSkip, onSubmit, onBack }: Props) {
  const { t } = useTranslation()
  const [scheduledLocal, setScheduledLocal] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!scheduledLocal) {
      onSkip()
      return
    }
    onSubmit(new Date(scheduledLocal).toISOString())
  }

  return (
    <form
      className="transfer-step"
      data-testid="pix-schedule"
      onSubmit={handleSubmit}
    >
      <h2>{t('transfers.steps.schedule')}</h2>
      <label className="field" htmlFor="pix-schedule-input">
        <span>{t('transfers.form.scheduleOptional')}</span>
        <input
          id="pix-schedule-input"
          type="datetime-local"
          data-testid="pix-schedule-input"
          value={scheduledLocal}
          onChange={(event) => setScheduledLocal(event.target.value)}
        />
      </label>
      <p className="transfer-step__or">{t('transfers.form.scheduleHint')}</p>
      <div className="transfer-actions">
        <Button type="button" variant="secondary" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          data-testid="pix-skip-schedule"
          onClick={onSkip}
        >
          {t('transfers.form.skipSchedule')}
        </Button>
        <Button type="submit" data-testid="pix-schedule-continue">
          {scheduledLocal
            ? t('transfers.form.scheduleContinue')
            : t('transfers.form.continue')}
        </Button>
      </div>
    </form>
  )
}
