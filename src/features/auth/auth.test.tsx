import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './AuthContext'
import { LoginPage } from './LoginPage'
import { RequireAuth } from './RequireAuth'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { handlers } from '@/mocks/handlers'
import { resetDb } from '@/mocks/data/db'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  sessionStorage.clear()
  resetDb()
})
afterAll(() => server.close())

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<div>Private Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('auth', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetDb()
  })

  it('redireciona para login sem token', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /reactmind/i })).toBeInTheDocument()
  })

  it('faz login com credenciais válidas', async () => {
    server.use(
      http.post('*/api/v1/login', () =>
        HttpResponse.json({
          valid: true,
          profile: { id: 'u1', name: 'Felipe Demo', email: 'demo@vuemind.dev' },
          system: { slug: 'reactmind', name: 'ReactMind' },
          systems: [],
          expiresAt: '2026-08-01T12:00:00.000Z',
        }),
      ),
    )
    const user = userEvent.setup()
    renderAt('/login')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Private Home')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('reactmind.token')).not.toBeNull()
  })
})
