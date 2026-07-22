import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '@/features/auth/AuthContext'
import { RequireAuth } from '@/features/auth/RequireAuth'

describe('AppShell', () => {
  beforeEach(() => {
    sessionStorage.setItem('reactmind.token', 'token')
    sessionStorage.setItem(
      'reactmind.user',
      JSON.stringify({ id: 'user-1', name: 'Ana Lima', email: 'ana@example.com' }),
    )
  })

  it('exibe usuário, navegação e conteúdo da rota privada', async () => {
    const { AppShell } = await import('./AppShell')

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/transactions']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/transactions" element={<h1>Extrato da conta</h1>} />
              </Route>
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Extrato' })).toHaveClass('active')
    expect(screen.getByRole('heading', { name: 'Extrato da conta' })).toBeInTheDocument()
  })

  it('encerra a sessão pelo botão Sair', async () => {
    const user = userEvent.setup()
    const { AppShell } = await import('./AppShell')

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/login" element={<h1>Login</h1>} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<h1>Dashboard</h1>} />
              </Route>
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(sessionStorage.getItem('reactmind.token')).toBeNull()
  })
})
