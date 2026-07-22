import { NavLink, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/shared/ui/Button'

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="shell">
      <header className="shell__header">
        <strong>ReactMind</strong>
        <span>{user?.name}</span>
        <Button type="button" onClick={logout}>
          Sair
        </Button>
      </header>
      <nav className="shell__nav" aria-label="Navegação principal">
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/transactions">Extrato</NavLink>
        <NavLink to="/beneficiaries">Favorecidos</NavLink>
        <NavLink to="/transfers/pix">PIX</NavLink>
      </nav>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  )
}
