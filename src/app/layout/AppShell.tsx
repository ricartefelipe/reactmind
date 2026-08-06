import { NavLink, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { useNotifications } from '@/features/notifications/hooks'

export function AppShell() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const notifications = useNotifications()
  const unreadCount =
    notifications.data?.items.filter((item) => !item.read).length ?? 0
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'

  return (
    <div className="shell">
      <header className="shell__header">
        <NavLink to="/" className="shell__brand" end>
          <span className="shell__mark" aria-hidden="true" />
          {t('app.name')}
        </NavLink>
        <nav className="shell__nav" aria-label="Principal">
          <NavLink to="/" end>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/transactions">{t('nav.transactions')}</NavLink>
          <NavLink to="/beneficiaries">{t('nav.beneficiaries')}</NavLink>
          <NavLink to="/transfers/pix">{t('nav.transferPix')}</NavLink>
          <NavLink to="/notifications" className="shell__link--badge">
            {t('nav.notifications')}
            {unreadCount > 0 ? (
              <span
                className="shell__badge"
                data-testid="notifications-badge"
              >
                {unreadCount}
              </span>
            ) : null}
          </NavLink>
          <NavLink to="/settings">{t('nav.settings')}</NavLink>
        </nav>
        <div className="shell__user" data-testid="shell-user">
          <span className="shell__avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="shell__username">{user?.name}</span>
        </div>
      </header>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  )
}
