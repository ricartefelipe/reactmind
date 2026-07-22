import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { handlers } from '@/mocks/handlers'
import { resetDb } from '@/mocks/data/db'
import { BeneficiariesPage } from './BeneficiariesPage'

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
        <BeneficiariesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('beneficiaries', () => {
  it('lista, cria e remove favorecidos', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('ana@email.com')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome'), 'João Souza')
    await user.type(screen.getByLabelText('Chave PIX'), '11999999999')
    await user.click(screen.getByRole('button', { name: 'Adicionar favorecido' }))

    expect(await screen.findByText('João Souza')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('Chave PIX')).toHaveValue('')

    await user.click(
      screen.getByRole('button', { name: 'Remover João Souza' }),
    )

    await waitFor(() => {
      expect(screen.queryByText('João Souza')).not.toBeInTheDocument()
    })
  })

  it('exibe estado vazio', async () => {
    server.use(
      http.get('*/api/v1/beneficiaries', () =>
        HttpResponse.json({ items: [] }),
      ),
    )

    renderPage()

    expect(
      await screen.findByText('Nenhum favorecido cadastrado.'),
    ).toBeInTheDocument()
  })

  it('exibe erros de consulta e mutation', async () => {
    server.use(
      http.get('*/api/v1/beneficiaries', () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    )

    const { unmount } = renderPage()
    expect(
      await screen.findByText('Não foi possível carregar os favorecidos.'),
    ).toBeInTheDocument()
    unmount()
    server.resetHandlers()

    server.use(
      http.post('*/api/v1/beneficiaries', () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    )

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Ana Silva')
    await user.type(screen.getByLabelText('Nome'), 'João Souza')
    await user.type(screen.getByLabelText('Chave PIX'), '11999999999')
    await user.click(screen.getByRole('button', { name: 'Adicionar favorecido' }))

    expect(
      await screen.findByText('Não foi possível adicionar o favorecido.'),
    ).toBeInTheDocument()
  })
})
