import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAppHandlers } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/render'
import { BeneficiariesPage } from './BeneficiariesPage'

const server = setupServer(...createAppHandlers())

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers(...createAppHandlers())
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

describe('beneficiaries', () => {
  it('lista, cria e remove favorecidos', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BeneficiariesPage />)

    expect(await screen.findByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText(/ana@email.com/)).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome'), 'João Souza')
    await user.selectOptions(screen.getByTestId('beneficiary-type'), 'EMAIL')
    await user.type(screen.getByLabelText('Chave PIX'), 'joao@email.com')
    await user.click(screen.getByTestId('beneficiary-submit'))

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

    renderWithProviders(<BeneficiariesPage />)

    expect(await screen.findByText('Nenhum favorecido')).toBeInTheDocument()
  })

  it('exibe erros de consulta e mutation', async () => {
    server.use(
      http.get('*/api/v1/beneficiaries', () =>
        HttpResponse.json(
          { code: 'HTTP_ERROR', message: 'falha', correlationId: 'c1' },
          { status: 500 },
        ),
      ),
    )

    const { unmount } = renderWithProviders(<BeneficiariesPage />)
    expect(await screen.findByTestId('error-banner')).toBeInTheDocument()
    unmount()

    server.resetHandlers(...createAppHandlers())
    server.use(
      http.post('*/api/v1/beneficiaries', () =>
        HttpResponse.json(
          { code: 'HTTP_ERROR', message: 'falha create', correlationId: 'c2' },
          { status: 500 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<BeneficiariesPage />)
    await screen.findByText('Ana Silva')
    await user.type(screen.getByLabelText('Nome'), 'João Souza')
    await user.type(screen.getByLabelText('Chave PIX'), 'joao@email.com')
    await user.click(screen.getByTestId('beneficiary-submit'))

    expect(await screen.findByText('falha create')).toBeInTheDocument()
  })
})
