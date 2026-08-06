import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAppHandlers } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/render'
import { DashboardPage } from './DashboardPage'
import { TransactionsPage } from './TransactionsPage'

const server = setupServer(...createAppHandlers())

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers(...createAppHandlers())
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

describe('wallet', () => {
  it('exibe saldo, limite e atalhos no dashboard', async () => {
    renderWithProviders(<DashboardPage />)

    expect(await screen.findByTestId('available-balance')).toHaveTextContent(
      'R$',
    )
    expect(screen.getByTestId('daily-limit-bar')).toBeInTheDocument()
    expect(screen.getByTestId('onboarding-checklist')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Extrato' })).toHaveAttribute(
      'href',
      '/transactions',
    )
    expect(screen.getByRole('link', { name: 'Favorecidos' })).toHaveAttribute(
      'href',
      '/beneficiaries',
    )
    expect(screen.getByRole('link', { name: 'PIX' })).toHaveAttribute(
      'href',
      '/transfers/pix',
    )
  })

  it('lista transações e filtra por busca', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TransactionsPage />)

    expect(await screen.findByTestId('transactions-list')).toHaveTextContent(
      'Carlos',
    )

    await user.clear(screen.getByTestId('transactions-search'))
    await user.type(screen.getByTestId('transactions-search'), 'mercado')
    await user.click(screen.getByRole('button', { name: 'Filtrar' }))

    expect(await screen.findByTestId('transactions-list')).toHaveTextContent(
      'Mercado Central',
    )
    expect(screen.getByTestId('transactions-list')).toHaveTextContent(
      'Pagamento mercado',
    )
  })
})
