import type { ApiErrorBody } from '@/shared/types/api'
import { ApiError } from '@/shared/http/errors'
import { createCorrelationId } from '@/shared/utils/id'

const BASE = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}api/v1`

let authTokenAccessor: () => string | null = () => null

export function setAuthTokenAccessor(fn: () => string | null): void {
  authTokenAccessor = fn
}

type HttpOptions = {
  body?: unknown
  idempotencyKey?: string
}

async function request<T>(method: string, path: string, options: HttpOptions = {}): Promise<T> {
  const correlationId = createCorrelationId()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Correlation-Id': correlationId,
  }
  const token = authTokenAccessor()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    let body: ApiErrorBody | undefined
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      /* ignore */
    }
    throw new ApiError(
      response.status,
      body?.code ?? 'HTTP_ERROR',
      body?.message ?? response.statusText,
      body?.correlationId ?? correlationId,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown, idempotencyKey?: string) =>
    request<T>('POST', path, { body, idempotencyKey }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
