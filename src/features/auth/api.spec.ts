import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginRequest } from './api'

describe('loginRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('autentica via API nativa /auth/login', async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        accessToken: 'mock-jwt-demo',
        user: { id: 'u1', name: 'Felipe Demo', email: 'demo@vuemind.dev' },
      }),
    }))
    vi.stubGlobal('fetch', fetch)

    await expect(loginRequest('demo@vuemind.dev', 'demo123')).resolves.toEqual({
      accessToken: 'mock-jwt-demo',
      user: { id: 'u1', name: 'Felipe Demo', email: 'demo@vuemind.dev' },
    })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/login$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'demo@vuemind.dev', password: 'demo123' }),
      }),
    )
  })

  it('propaga erro de credenciais inválidas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos.',
          correlationId: 'c1',
        }),
      })),
    )

    await expect(loginRequest('demo@vuemind.dev', 'incorreta')).rejects.toMatchObject({
      status: 401,
      message: 'Email ou senha inválidos.',
    })
  })
})
