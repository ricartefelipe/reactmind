import { http } from '@/shared/http/client'
import type { LoginResponse } from './types'

export function loginRequest(email: string, password: string) {
  return http.post<LoginResponse>('/auth/login', { email, password })
}
