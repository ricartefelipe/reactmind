import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { handlers } from '@/mocks/handlers'
import { resetDb } from '@/mocks/data/db'
import { DashboardPage } from './DashboardPage'
import { TransactionsPage } from './TransactionsPage'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  resetDb()
})
afterAll(() => server.close())

function renderPage(page: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{page}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('wallet', () => {
  it('exibe o saldo disponível e os atalhos no dashboard', async () => {
    renderPage(<DashboardPage />)

    expect(await screen.findByText('R$ 2.500,00')).toBeInTheDocument()
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

  it('lista transações e filtra por tipo', async () => {
    const user = userEvent.setup()
    renderPage(<TransactionsPage />)

    expect(await screen.findByText('Carlos')).toBeInTheDocument()
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Tipo'), 'PIX_OUT')

    expect(
      await screen.findByText('Nenhuma transação encontrada.'),
    ).toBeInTheDocument()
  })
})
