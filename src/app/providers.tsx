import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/AuthContext'
import { SettingsProvider } from '@/features/settings/SettingsContext'
import '@/app/i18n'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <HashRouter>{children}</HashRouter>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
