import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { getDb, resetDb } from '@/mocks/data/db'
import { handlers } from '@/mocks/handlers'
import { executePix } from '@/mocks/handlers/transfers.handlers'
import { walletKeys } from '@/features/wallet/hooks'
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

  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TransferPixPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )

  return { ...view, client }
}

async function completeForm() {
  const user = userEvent.setup()
  await screen.findByRole('option', { name: 'Ana Silva' })
  await user.selectOptions(screen.getByLabelText('Favorecido'), 'b1')
  await user.type(screen.getByLabelText('Valor'), '10,00')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  return user
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

  it('conclui um PIX e exibe o comprovante', async () => {
    renderPage()
    const user = await completeForm()

    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar PIX' }))

    expect(
      await screen.findByRole('heading', { name: 'Comprovante PIX' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument()
  })

  it('reutiliza a Idempotency-Key ao voltar e tentar novamente após erro', async () => {
    const keys: string[] = []
    let attempts = 0
    server.use(
      http.post('*/api/v1/transfers/pix', async ({ request }) => {
        const idempotencyKey = request.headers.get('Idempotency-Key')
        if (!idempotencyKey) {
          return HttpResponse.json({ code: 'MISSING_KEY' }, { status: 400 })
        }
        keys.push(idempotencyKey)
        attempts += 1
        if (attempts === 1) {
          return HttpResponse.json(
            { code: 'HTTP_ERROR', message: 'Falha temporária' },
            { status: 500 },
          )
        }

        const body = (await request.json()) as {
          beneficiaryId: string
          amountCents: number
        }
        const transfer = executePix(getDb(), { ...body, idempotencyKey })
        return HttpResponse.json(transfer, { status: 201 })
      }),
    )
    renderPage()
    const user = await completeForm()

    await user.click(screen.getByRole('button', { name: 'Confirmar PIX' }))
    expect(
      await screen.findByText('Não foi possível concluir a transferência PIX.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar PIX' }))

    expect(
      await screen.findByRole('heading', { name: 'Comprovante PIX' }),
    ).toBeInTheDocument()
    expect(keys).toHaveLength(2)
    expect(keys[1]).toBe(keys[0])
  })

  it('refaz a consulta de saldo após concluir o PIX', async () => {
    const { client } = renderPage()
    const user = await completeForm()

    await user.click(screen.getByRole('button', { name: 'Confirmar PIX' }))
    await screen.findByRole('heading', { name: 'Comprovante PIX' })

    await waitFor(() => {
      expect(client.getQueryData(walletKeys.balance)).toEqual({
        availableCents: 249_000,
        currency: 'BRL',
      })
    })
    expect(getDb().availableCents).toBe(249_000)
  })
})
