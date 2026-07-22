export type CreatePixInput = {
  beneficiaryId: string
  amountCents: number
}

export type CreatePixVariables = CreatePixInput & {
  idempotencyKey: string
}

export type Transfer = {
  id: string
  beneficiaryId: string
  amountCents: number
  status: 'COMPLETED'
  createdAt: string
}
