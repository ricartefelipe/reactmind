import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/app/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { BeneficiariesPage } from '@/features/beneficiaries/BeneficiariesPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TransferPixPage } from '@/features/transfers/TransferPixPage'
import { DashboardPage } from '@/features/wallet/DashboardPage'
import { TransactionsPage } from '@/features/wallet/TransactionsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/transfers/pix" element={<TransferPixPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
