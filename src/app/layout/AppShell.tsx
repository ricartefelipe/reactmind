import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { useNotifications } from '@/features/notifications/hooks'

export function AppShell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const notifications = useNotifications()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRootRef = useRef<HTMLDivElement | null>(null)
  const unreadCount =
    notifications.data?.items.filter((item) => !item.read).length ?? 0
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'

  useEffect(() => {
    if (!menuOpen) return

    function onDocumentClick(event: MouseEvent) {
      if (!menuRootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function onDocumentKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onDocumentKeydown)
    return () => {
      document.removeEventListener('click', onDocumentClick)
      document.removeEventListener('keydown', onDocumentKeydown)
    }
  }, [menuOpen])

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
          <NavLink to="/arquivo">{t('nav.archive')}</NavLink>
          <NavLink to="/settings">{t('nav.settings')}</NavLink>
        </nav>
        <div className="shell__user-menu" ref={menuRootRef}>
          <button
            type="button"
            className="shell__user"
            data-testid="shell-user"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={t('account.menu')}
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((open) => !open)
            }}
          >
            <span className="shell__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="shell__username">{user?.name}</span>
          </button>
          {menuOpen ? (
            <div
              className="shell__menu"
              role="menu"
              data-testid="shell-user-menu"
            >
              <div className="shell__menu-profile" role="none">
                <p className="shell__menu-label">{t('account.profile')}</p>
                <p className="shell__menu-name">{user?.name}</p>
                <p className="shell__menu-email">{user?.email}</p>
              </div>
              <button
                type="button"
                className="shell__menu-item"
                role="menuitem"
                data-testid="shell-account-settings"
                onClick={() => {
                  setMenuOpen(false)
                  void navigate('/settings')
                }}
              >
                {t('account.settings')}
              </button>
              <button
                type="button"
                className="shell__menu-item shell__menu-item--danger"
                role="menuitem"
                data-testid="shell-logout"
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                  void navigate('/login')
                }}
              >
                {t('account.logout')}
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  )
}
