import { Link } from 'react-router'
import { useBalance } from './hooks'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { LoadingBlock } from '@/shared/ui/LoadingBlock'
import { formatCents } from '@/shared/utils/money'

const shortcuts = [
  { to: '/transactions', label: 'Extrato' },
  { to: '/beneficiaries', label: 'Favorecidos' },
  { to: '/transfers/pix', label: 'PIX' },
] as const

export function DashboardPage() {
  const balance = useBalance()

  return (
    <section className="wallet-page">
      <h1>Dashboard</h1>

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

      <nav className="wallet-shortcuts" aria-label="Atalhos">
        {shortcuts.map((shortcut) => (
          <Link className="btn" key={shortcut.to} to={shortcut.to}>
            {shortcut.label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
