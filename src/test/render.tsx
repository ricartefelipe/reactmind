import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { ReactElement, ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/AuthContext'
import { SettingsProvider } from '@/features/settings/SettingsContext'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { route?: string },
) {
  const client = createTestQueryClient()
  const route = options?.route ?? '/'

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={client}>
        <SettingsProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </AuthProvider>
        </SettingsProvider>
      </QueryClientProvider>
    )
  }

  return {
    client,
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}
