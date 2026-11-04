import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

    expect(screen.getByTestId('shell-user')).toHaveTextContent('Ana Lima')
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveClass(
      'active',
    )
    expect(screen.getByRole('link', { name: 'Extrato' })).toHaveClass('active')
    expect(
      screen.getByRole('heading', { name: 'Extrato da conta' }),
    ).toBeInTheDocument()
    expect(await screen.findByTestId('notifications-badge')).toBeInTheDocument()
  })

  it('o botão de menu abre e fecha a navegação e informa o estado', async () => {
    const user = userEvent.setup()
    renderShell()

    const toggle = screen.getByTestId('shell-nav-toggle')
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', nav.id)
    expect(nav).not.toHaveClass('shell__nav--open')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(nav).toHaveClass('shell__nav--open')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(nav).not.toHaveClass('shell__nav--open')
  })

  it('Esc fecha a navegação aberta e devolve o foco ao botão de menu', async () => {
    const user = userEvent.setup()
    renderShell()

    const toggle = screen.getByTestId('shell-nav-toggle')
    await user.click(toggle)
    await user.tab()
    expect(screen.getByRole('link', { name: 'Início' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('escolher uma página fecha a navegação', async () => {
    const user = userEvent.setup()
    renderShell()

    const toggle = screen.getByTestId('shell-nav-toggle')
    await user.click(toggle)
    await user.click(screen.getByRole('link', { name: 'Início' }))

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('abre menu da conta com perfil, ajustes e sair', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByTestId('shell-user'))

    expect(screen.getByTestId('shell-user-menu')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByTestId('shell-account-settings')).toBeInTheDocument()
    expect(screen.getByTestId('shell-logout')).toBeInTheDocument()
  })
})
