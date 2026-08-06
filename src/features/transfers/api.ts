import { http } from '@/shared/http/client'
import type { CreatePixInput, PixTransfer, QrPayloadResponse } from './types'

export function createPix(
  body: CreatePixInput,
  idempotencyKey: string,
): Promise<PixTransfer> {
  return http.post<PixTransfer>('/transfers/pix', body, idempotencyKey)
}

export function fetchTransfer(id: string) {
  return http.get<PixTransfer>(`/transfers/${id}`)
}

export function fetchQrPayload(amountCents: number, pixKey: string) {
  const params = new URLSearchParams({
    amountCents: String(amountCents),
    pixKey,
  })
  return http.get<QrPayloadResponse>(
    `/transfers/pix/qr-payload?${params.toString()}`,
  )
}
