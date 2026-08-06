import type { PixKeyType } from '@/shared/utils/pixKey'

export type TransferStep =
  | 'destination'
  | 'amount'
  | 'schedule'
  | 'confirm'
  | 'receipt'

export type PixDestination =
  | { mode: 'beneficiary'; beneficiaryId: string }
  | { mode: 'key'; pixKey: string; pixKeyType: PixKeyType }

export type CreatePixInput = {
  amountCents: number
  beneficiaryId?: string
  pixKey?: string
  pixKeyType?: PixKeyType
  scheduledFor?: string
}

export type CreatePixVariables = CreatePixInput & {
  idempotencyKey: string
}

export type TransferStatus = 'COMPLETED' | 'SCHEDULED' | 'FAILED'

export type PixTransfer = {
  id: string
  beneficiaryId?: string
  pixKey?: string
  pixKeyType?: PixKeyType
  amountCents: number
  status: TransferStatus
  createdAt: string
  scheduledFor?: string
  endToEndId: string
  correlationId: string
}

export type QrPayloadResponse = {
  payload: string
}
