import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Input } from '@/shared/ui/Input'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <div className="login__brand">
        <p className="login__eyebrow">React · Carteira</p>
        <h1>{t('login.title')}</h1>
        <p>{t('login.subtitle')}</p>
      </div>
      <div className="login__panel">
        {error && <ErrorBanner message={error} />}
        <form onSubmit={onSubmit}>
          <Input
            label={t('login.email')}
            type="email"
            value={email}
            onChange={setEmail}
          />
          <Input
            label={t('login.password')}
            type="password"
            value={password}
            onChange={setPassword}
          />
          <Button type="submit" disabled={loading}>
            {loading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>
      </div>
    </main>
  )
}
