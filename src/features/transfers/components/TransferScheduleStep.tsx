import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/Button'

type Props = Readonly<{
  onSkip: () => void
  onSubmit: (iso: string) => void
  onBack: () => void
}>

/** Mesmo limite da API: no futuro e até 365 dias. */
const MAX_DAYS_AHEAD = 365
const DAY_MS = 24 * 60 * 60 * 1000

/** Formato de `datetime-local` (hora local, sem fuso), para os limites do campo. */
function toLocalInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function TransferScheduleStep({ onSkip, onSubmit, onBack }: Props) {
  const { t } = useTranslation()
  const [scheduledLocal, setScheduledLocal] = useState('')
  const [scheduleError, setScheduleError] = useState('')
  const { minLocal, maxLocal } = useMemo(() => {
    const now = Date.now()
    return {
      minLocal: toLocalInput(new Date(now + 60_000)),
      maxLocal: toLocalInput(new Date(now + MAX_DAYS_AHEAD * DAY_MS)),
    }
  }, [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setScheduleError('')
    if (!scheduledLocal) {
      onSkip()
      return
    }
    const chosen = new Date(scheduledLocal)
    const current = Date.now()
    if (Number.isNaN(chosen.getTime()) || chosen.getTime() <= current) {
      setScheduleError(t('transfers.form.scheduleInPast'))
      return
    }
    if (chosen.getTime() > current + MAX_DAYS_AHEAD * DAY_MS) {
      setScheduleError(t('transfers.form.scheduleTooFar'))
      return
    }
    onSubmit(chosen.toISOString())
  }

  return (
    // noValidate: a validação é a do passo, com a mensagem traduzida e anunciada; min e max só guiam o seletor.
    <form
      className="transfer-step"
      data-testid="pix-schedule"
      noValidate
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
          min={minLocal}
          max={maxLocal}
          aria-invalid={scheduleError ? 'true' : undefined}
          aria-describedby={
            scheduleError ? 'pix-schedule-hint pix-schedule-error' : 'pix-schedule-hint'
          }
          onChange={(event) => setScheduledLocal(event.target.value)}
        />
      </label>
      <p id="pix-schedule-hint" className="transfer-step__or">
        {t('transfers.form.scheduleHint')}
      </p>
      {scheduleError ? (
        <p
          id="pix-schedule-error"
          className="transfer-step__error"
          role="alert"
          data-testid="pix-schedule-error"
        >
          {scheduleError}
        </p>
      ) : null}
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
