import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { resetDb } from '@/mocks/data/db'
import { handlers } from '@/mocks/handlers'
import { TransferPixPage } from './TransferPixPage'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  resetDb()
})
afterAll(() => server.close())

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TransferPixPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TransferPixPage', () => {
  it('mantém Continuar desabilitado para valor zero', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('option', { name: 'Ana Silva' })
    await user.selectOptions(
      screen.getByLabelText('Favorecido'),
      'b1',
    )
    await user.type(screen.getByLabelText('Valor'), '0')

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })
})
