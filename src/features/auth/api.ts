import { http } from '@/shared/http/client'
import { shouldUseTotalRecallLogin } from '@/shared/http/apiConfig'
import { ApiError } from '@/shared/http/errors'
import { loginTotalRecall, totalRecallSession } from '@/shared/totalrecall'
import type { LoginResponse } from './types'

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  if (shouldUseTotalRecallLogin()) {
    const result = await loginTotalRecall(email, password, 'reactmind')
    if (!result) {
      throw new ApiError(503, 'TOTALRECALL_UNAVAILABLE', 'Não foi possível validar o acesso. Tente novamente.', '')
    }
    if (!result.valid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos.', '')
    }
    return totalRecallSession(result)
  }

  return http.post<LoginResponse>('/auth/login', { email, password })
}
