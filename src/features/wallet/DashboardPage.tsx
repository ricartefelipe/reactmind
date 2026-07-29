import { Link } from 'react-router'
import { useBalance } from './hooks'
import { useAuth } from '@/features/auth/AuthContext'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { LoadingBlock } from '@/shared/ui/LoadingBlock'
import { formatCents } from '@/shared/utils/money'

const shortcuts = [
  { to: '/transfers/pix', label: 'PIX', icon: '↗' },
  { to: '/transactions', label: 'Extrato', icon: '≡' },
  { to: '/beneficiaries', label: 'Favorecidos', icon: '◎' },
] as const

export function DashboardPage() {
  const balance = useBalance()
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]

  return (
    <section className="wallet-page">
      <div>
        <p className="wallet-page__eyebrow">Olá{firstName ? `, ${firstName}` : ''}</p>
        <h1>ReactMind</h1>
      </div>

      <section className="balance-card" aria-labelledby="balance-title">
        <h2 id="balance-title">Saldo disponível</h2>
        {balance.isPending && <LoadingBlock label="Carregando saldo…" />}
        {balance.isError && (
          <ErrorBanner message="Não foi possível carregar o saldo." />
        )}
        {balance.data && (
          <strong className="balance-card__value">
            {formatCents(
              balance.data.availableCents,
              'pt-BR',
              balance.data.currency,
            )}
          </strong>
        )}
      </section>

      <div>
        <h2>Movimentar</h2>
        <nav className="wallet-shortcuts" aria-label="Atalhos">
          {shortcuts.map((shortcut) => (
            <Link key={shortcut.to} to={shortcut.to}>
              <span className="shortcut-icon" aria-hidden="true">
                {shortcut.icon}
              </span>
              {shortcut.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
