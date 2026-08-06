import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAppHandlers } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/render'
import { fetchBalance } from '@/features/wallet/api'
import { walletKeys } from '@/features/wallet/hooks'
import { TransferPixPage } from './TransferPixPage'

const server = setupServer(...createAppHandlers())

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers(...createAppHandlers())
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

async function completeToConfirm() {
  const user = userEvent.setup()
  await screen.findByRole('option', { name: /Ana Silva/ })
  await user.selectOptions(screen.getByTestId('pix-beneficiary'), 'b1')
  await user.click(screen.getByTestId('pix-destination-continue'))
  await user.type(screen.getByLabelText(/Valor/), '10,00')
  await user.click(screen.getByTestId('pix-amount-continue'))
  await user.click(screen.getByTestId('pix-skip-schedule'))
  return user
}

describe('TransferPixPage', () => {
  it('mantém Continuar bloqueado sem destino', async () => {
    renderWithProviders(<TransferPixPage />)
    await screen.findByTestId('pix-destination-continue')
    expect(screen.getByTestId('pix-destination')).toBeInTheDocument()
  })

  it('conclui um PIX e exibe o comprovante', async () => {
    renderWithProviders(<TransferPixPage />)
    const user = await completeToConfirm()

    expect(screen.getByText(/Ana Silva/)).toBeInTheDocument()
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument()

    await user.click(screen.getByTestId('pix-confirm-submit'))

    expect(await screen.findByTestId('pix-receipt')).toBeInTheDocument()
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    expect(screen.getByTestId('pix-end-to-end')).not.toBeEmptyDOMElement()
  })

  it('reutiliza a Idempotency-Key no retry após erro', async () => {
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
            {
              code: 'HTTP_ERROR',
              message: 'Falha temporária',
              correlationId: 'corr-1',
            },
            { status: 500 },
          )
        }
        return HttpResponse.json(
          {
            id: 'tx-retry',
            beneficiaryId: 'b1',
            amountCents: 1000,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
            endToEndId: 'E2E123',
            correlationId: 'corr-2',
          },
          { status: 201 },
        )
      }),
    )
    renderWithProviders(<TransferPixPage />)
    const user = await completeToConfirm()

    await user.click(screen.getByTestId('pix-confirm-submit'))
    expect(await screen.findByTestId('error-banner')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByTestId('pix-receipt')).toBeInTheDocument()
    expect(keys).toHaveLength(2)
    expect(keys[1]).toBe(keys[0])
  })

  it('refaz a consulta de saldo após concluir o PIX', async () => {
    const { client } = renderWithProviders(<TransferPixPage />)
    await client.fetchQuery({
      queryKey: walletKeys.balance,
      queryFn: fetchBalance,
    })
    const user = await completeToConfirm()

    await user.click(screen.getByTestId('pix-confirm-submit'))
    await screen.findByTestId('pix-receipt')

    await waitFor(() => {
      expect(client.getQueryData(walletKeys.balance)).toMatchObject({
        availableCents: 249_000,
        currency: 'BRL',
      })
    })
  })
})
