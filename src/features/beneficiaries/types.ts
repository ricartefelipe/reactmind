import type { PixKeyType } from '@/shared/utils/pixKey'

export type { PixKeyType }

export type Beneficiary = {
  id: string
  name: string
  pixKey: string
  pixKeyType: PixKeyType
}

export type CreateBeneficiaryInput = {
  name: string
  pixKey: string
  pixKeyType: PixKeyType
}
