import { useTranslation } from 'react-i18next'
import type { OnboardingStep } from '@/features/onboarding/types'

type Props = Readonly<{
  steps: OnboardingStep[]
  completed: boolean
  doneCount: number
}>

export function OnboardingChecklist({ steps, completed, doneCount }: Props) {
  const { t } = useTranslation()

  return (
    <section className="onboarding" data-testid="onboarding-checklist">
      <header className="onboarding__header">
        <h2>
          {completed
            ? t('wallet.onboardingComplete')
            : t('wallet.onboardingTitle')}
        </h2>
        <span data-testid="onboarding-progress">
          {doneCount}/{steps.length}
        </span>
      </header>
      <ul className="onboarding__list">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`onboarding__item${step.done ? ' onboarding__item--done' : ''}`}
            data-testid={`onboarding-step-${step.id}`}
          >
            <span className="onboarding__check" aria-hidden="true">
              {step.done ? '✓' : '○'}
            </span>
            <span>{t(`wallet.onboarding.${step.id}`)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
