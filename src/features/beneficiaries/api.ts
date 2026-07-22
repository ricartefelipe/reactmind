import { http } from '@/shared/http/client'
import type { Beneficiary, CreateBeneficiaryInput } from './types'

export function fetchBeneficiaries() {
  return http.get<{ items: Beneficiary[] }>('/beneficiaries')
}

export function createBeneficiary(body: CreateBeneficiaryInput) {
  return http.post<Beneficiary>('/beneficiaries', body)
}

export function deleteBeneficiary(id: string) {
  return http.delete<void>(`/beneficiaries/${id}`)
}
