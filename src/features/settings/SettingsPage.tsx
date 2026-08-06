import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import type { AppLocale } from '@/app/i18n'
import type { Theme } from '@/app/theme/applyTheme'
import { Button } from '@/shared/ui/Button'
import { useSettings } from './SettingsContext'

export function SettingsPage() {
  const { t } = useTranslation()
  const { theme, locale, setTheme, setLocale } = useSettings()
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    void navigate('/login', { replace: true })
  }

  return (
    <section className="wallet-page">
      <h1>{t('settings.title')}</h1>

      <fieldset className="settings-group">
        <legend>{t('settings.theme')}</legend>
        <Button
          type="button"
          variant={theme === 'light' ? 'primary' : 'secondary'}
          onClick={() => setTheme('light' satisfies Theme)}
        >
          {t('settings.themeLight')}
        </Button>
        <Button
          type="button"
          variant={theme === 'dark' ? 'primary' : 'secondary'}
          onClick={() => setTheme('dark' satisfies Theme)}
        >
          {t('settings.themeDark')}
        </Button>
      </fieldset>

      <fieldset className="settings-group">
        <legend>{t('settings.locale')}</legend>
        <Button
          type="button"
          variant={locale === 'pt-BR' ? 'primary' : 'secondary'}
          onClick={() => setLocale('pt-BR' satisfies AppLocale)}
        >
          {t('settings.localePtBr')}
        </Button>
        <Button
          type="button"
          variant={locale === 'en' ? 'primary' : 'secondary'}
          onClick={() => setLocale('en' satisfies AppLocale)}
        >
          {t('settings.localeEn')}
        </Button>
      </fieldset>

      <fieldset className="settings-group">
        <legend>{t('nav.logout')}</legend>
        <Button
          type="button"
          variant="secondary"
          data-testid="settings-logout"
          onClick={handleLogout}
        >
          {t('settings.logout')}
        </Button>
      </fieldset>
    </section>
  )
}
