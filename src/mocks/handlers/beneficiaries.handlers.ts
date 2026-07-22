import { createCorrelationId } from '@/shared/utils/id'
import type { ApiErrorBody } from '@/shared/types/api'
import { HttpResponse, http } from 'msw'
import { getDb } from '../data/db'

export const beneficiariesHandlers = [
  http.get('*/api/v1/beneficiaries', () => {
    const db = getDb()
    return HttpResponse.json({ items: db.beneficiaries })
  }),

  http.post('*/api/v1/beneficiaries', async ({ request }) => {
    const db = getDb()
    const correlationId = request.headers.get('X-Correlation-Id') ?? createCorrelationId()
    const body = (await request.json()) as { name: string; pixKey: string }
    if (!body.name?.trim() || !body.pixKey?.trim()) {
      const error: ApiErrorBody = {
        code: 'INVALID_BENEFICIARY',
        message: 'Nome e chave PIX são obrigatórios.',
        correlationId,
      }
      return HttpResponse.json(error, { status: 400 })
    }
    const created = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      pixKey: body.pixKey.trim(),
    }
    db.beneficiaries.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.delete('*/api/v1/beneficiaries/:id', ({ params, request }) => {
    const db = getDb()
    const correlationId = request.headers.get('X-Correlation-Id') ?? createCorrelationId()
    const index = db.beneficiaries.findIndex((beneficiary) => beneficiary.id === params.id)
    if (index < 0) {
      const error: ApiErrorBody = {
        code: 'BENEFICIARY_NOT_FOUND',
        message: 'Favorecido não encontrado.',
        correlationId,
      }
      return HttpResponse.json(error, { status: 404 })
    }
    db.beneficiaries.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
