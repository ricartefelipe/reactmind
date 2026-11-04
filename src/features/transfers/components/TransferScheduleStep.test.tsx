import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TransferScheduleStep } from './TransferScheduleStep'

const AGORA = new Date('2026-11-04T12:00:00')

function renderStep() {
  const handlers = { onSkip: vi.fn(), onSubmit: vi.fn(), onBack: vi.fn() }
  render(<TransferScheduleStep {...handlers} />)
  return handlers
}

function escolher(valor: string) {
  fireEvent.change(screen.getByTestId('pix-schedule-input'), { target: { value: valor } })
  fireEvent.submit(screen.getByTestId('pix-schedule'))
}

describe('TransferScheduleStep', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(AGORA)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('limita o campo à janela da API: a partir do próximo minuto e até 365 dias', () => {
    renderStep()
    const input = screen.getByTestId('pix-schedule-input')

    expect(input).toHaveAttribute('min', '2026-11-04T12:01')
    expect(input).toHaveAttribute('max', '2027-11-04T12:00')
    // A mensagem do passo substitui a nativa do navegador, que barraria o envio antes dela.
    expect(screen.getByTestId('pix-schedule')).toHaveAttribute('novalidate')
  })

  it('data no futuro envia o horário em ISO', () => {
    const { onSubmit } = renderStep()
    escolher('2026-11-04T12:30')

    expect(onSubmit).toHaveBeenCalledWith(new Date('2026-11-04T12:30').toISOString())
    expect(screen.queryByTestId('pix-schedule-error')).toBeNull()
  })

  it('data no passado mostra o erro, ligado ao campo, e não envia', () => {
    const { onSubmit } = renderStep()
    escolher('2026-11-04T11:59')

    expect(onSubmit).not.toHaveBeenCalled()
    const erro = screen.getByTestId('pix-schedule-error')
    expect(erro).toHaveAttribute('role', 'alert')
    expect(erro).toHaveTextContent('Escolha uma data e hora no futuro.')
    const input = screen.getByTestId('pix-schedule-input')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toContain('pix-schedule-error')
  })

  it('além de 365 dias mostra o erro e não envia', () => {
    const { onSubmit } = renderStep()
    escolher('2027-11-05T12:00')

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByTestId('pix-schedule-error')).toHaveTextContent('365 dias')
  })

  it('sem data, segue como envio imediato', () => {
    const { onSkip, onSubmit } = renderStep()
    fireEvent.submit(screen.getByTestId('pix-schedule'))

    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
