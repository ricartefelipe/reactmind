import { http } from '@/shared/http/client'
import type { LoginResponse } from './types'

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/login', { email, password })
}
