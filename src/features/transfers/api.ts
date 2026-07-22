import { http } from '@/shared/http/client'
import type { CreatePixInput, Transfer } from './types'

export function createPix(
  body: CreatePixInput,
  idempotencyKey: string,
): Promise<Transfer> {
  return http.post<Transfer>('/transfers/pix', body, idempotencyKey)
}
