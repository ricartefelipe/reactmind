import { screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import type { PixTransfer } from '../types'
import { TransferReceipt } from './TransferReceipt'

const server = setupServer(
  http.get('*/api/v1/beneficiaries', () => HttpResponse.json({ items: [] })),
)

beforeAll(() => server.listen())
afterAll(() => server.close())

const base: PixTransfer = {
  id: 'tr-1',
  beneficiaryId: 'b1',
  amountCents: 1050,
  status: 'COMPLETED',
  createdAt: '2026-11-03T12:00:00Z',
}

describe('TransferReceipt', () => {
  it('mostra o end-to-end e a correlação devolvidos pela API', () => {
    renderWithProviders(
      <TransferReceipt
        receipt={{ ...base, endToEndId: 'E99999999202611031200aB3dE5gH7jK', correlationId: 'corr-1' }}
        onAgain={() => {}}
      />,
    )

    expect(screen.getByTestId('pix-end-to-end')).toHaveTextContent('E99999999202611031200aB3dE5gH7jK')
    expect(screen.getByTestId('pix-correlation-id')).toHaveTextContent('corr-1')
    expect(screen.getByTestId('pix-simulated-note')).toHaveTextContent('PIX simulado')
  })

  it('sem o end-to-end, diz que não está disponível em vez de ficar vazio', () => {
    renderWithProviders(<TransferReceipt receipt={base} onAgain={() => {}} />)

    expect(screen.getByTestId('pix-end-to-end')).toHaveTextContent('Não disponível')
    expect(screen.getByTestId('pix-correlation-id')).toHaveTextContent('Não disponível')
  })

  it('no PIX agendado, explica que o código nasce na execução', () => {
    renderWithProviders(
      <TransferReceipt
        receipt={{ ...base, status: 'SCHEDULED', scheduledFor: '2026-11-04T12:00:00Z', correlationId: 'c' }}
        onAgain={() => {}}
      />,
    )

    expect(screen.getByTestId('pix-end-to-end')).toHaveTextContent('Gerado quando o PIX for executado')
  })
})
