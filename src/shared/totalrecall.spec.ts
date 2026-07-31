import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loginTotalRecall, totalRecallSession, totalRecallBaseUrl } from './totalrecall'

describe('totalRecallBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('usa HTTPS quando o protocolo da página é https (via self no SW)', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('self', { location: { protocol: 'https:' } })
    expect(totalRecallBaseUrl()).toBe('https://54.94.163.136.sslip.io')
  })

  it('usa HTTP em contexto local sem https', () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    expect(totalRecallBaseUrl()).toBe('http://54.94.163.136:9087')
  })
})

describe('loginTotalRecall', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { protocol: 'https:' } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('retorna null quando o fetch estoura o timeout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const signal = init?.signal
          if (!signal) return
          if (signal.aborted) {
            reject(new DOMException('Aborted', 'AbortError'))
            return
          }
          signal.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        })
      }),
    )

    const result = await loginTotalRecall('a@b.com', 'x', 'reactmind', 30)
    expect(result).toBeNull()
  })

  it('retorna o JSON quando o TR responde', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => ({ valid: false, reason: 'invalid_credentials' }),
      })),
    )

    const result = await loginTotalRecall('demo@vuemind.dev', 'demo123', 'reactmind', 1000)
    expect(result).toEqual({ valid: false, reason: 'invalid_credentials' })
  })

  it('cria uma sessão local com os dados do perfil autorizado', () => {
    expect(
      totalRecallSession({
        valid: true,
        profile: { id: 'profile-1', name: 'Felipe', email: 'felipe@example.com' },
        system: { slug: 'reactmind', name: 'ReactMind' },
        systems: [],
        expiresAt: '2026-08-01T12:00:00.000Z',
      }),
    ).toEqual({
      accessToken: 'totalrecall:profile-1',
      user: { id: 'profile-1', name: 'Felipe', email: 'felipe@example.com' },
    })
  })
})
