import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthContext'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { SettingsProvider } from '@/features/settings/SettingsContext'
import { createAppHandlers } from '@/mocks/handlers'
import { AppShell } from './AppShell'

const server = setupServer(...createAppHandlers())

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers(...createAppHandlers())
  sessionStorage.setItem('reactmind.token', 'token')
  sessionStorage.setItem(
    'reactmind.user',
    JSON.stringify({
      id: 'user-1',
      name: 'Ana Lima',
      email: 'ana@example.com',
    }),
  )
})
afterEach(() => {
  server.resetHandlers()
  sessionStorage.clear()
})
afterAll(() => server.close())

function renderShell(path = '/transactions') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <SettingsProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<h1>Home</h1>} />
                  <Route
                    path="/transactions"
                    element={<h1>Extrato da conta</h1>}
                  />
                </Route>
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>,
  )
}

describe('AppShell', () => {
  it('exibe usuário, navegação e badge de notificações', async () => {
    renderShell()

    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveClass(
      'active',
    )
    expect(screen.getByRole('link', { name: 'Extrato' })).toHaveClass('active')
    expect(
      screen.getByRole('heading', { name: 'Extrato da conta' }),
    ).toBeInTheDocument()
    expect(await screen.findByTestId('notifications-badge')).toBeInTheDocument()
  })
})
