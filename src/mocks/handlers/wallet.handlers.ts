import { HttpResponse, http } from 'msw'
import { getDb } from '../data/db'

export const walletHandlers = [
  http.get('*/api/v1/wallet/balance', () => {
    const db = getDb()
    return HttpResponse.json({
      availableCents: db.availableCents,
      currency: 'BRL',
    })
  }),

  http.get('*/api/v1/wallet/transactions', ({ request }) => {
    const db = getDb()
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    let items = [...db.transactions]
    if (type) items = items.filter((transaction) => transaction.type === type)
    return HttpResponse.json({ items })
  }),
]
