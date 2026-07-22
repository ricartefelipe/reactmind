import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Input } from '@/shared/ui/Input'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@vuemind.dev')
  const [password, setPassword] = useState('demo123')
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
    } catch (error) {
      setError(error instanceof ApiError ? error.message : 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <h1>ReactMind</h1>
      <p>Carteira digital de estudo</p>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={onSubmit}>
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <Input label="Senha" type="password" value={password} onChange={setPassword} />
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </main>
  )
}
