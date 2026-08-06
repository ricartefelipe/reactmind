import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './AuthContext'
import { LoginPage } from './LoginPage'
import { RequireAuth } from './RequireAuth'
import { SettingsProvider } from '@/features/settings/SettingsContext'
import { setupServer } from 'msw/node'
import { createAppHandlers } from '@/mocks/handlers'

const server = setupServer(...createAppHandlers())

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers(...createAppHandlers())
  sessionStorage.clear()
})
afterAll(() => server.close())

function renderAt(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <SettingsProvider>
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
      </SettingsProvider>
    </QueryClientProvider>,
  )
}

describe('auth', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('redireciona para login sem token', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { name: /reactmind/i }),
    ).toBeInTheDocument()
  })

  it('faz login com credenciais válidas', async () => {
    const user = userEvent.setup()
    renderAt('/login')
    await user.type(screen.getByLabelText('E-mail'), 'demo@vuemind.dev')
    await user.type(screen.getByLabelText('Senha'), 'demo123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Private Home')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('reactmind.token')).not.toBeNull()
  })
})
