import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/app/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { RequireAuth } from '@/features/auth/RequireAuth'

function Placeholder({ title }: { title: string }) {
  return <h1>{title}</h1>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Placeholder title="Dashboard" />} />
          <Route path="/transactions" element={<Placeholder title="Extrato" />} />
          <Route path="/beneficiaries" element={<Placeholder title="Favorecidos" />} />
          <Route path="/transfers/pix" element={<Placeholder title="PIX" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
