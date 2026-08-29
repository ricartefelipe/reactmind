import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import i18n, { type AppLocale } from '@/app/i18n'
import { applyTheme, type Theme } from '@/app/theme/applyTheme'

const STORAGE_KEY = 'reactmind.settings'

type SettingsState = {
  theme: Theme
  locale: AppLocale
}

type SettingsContextValue = SettingsState & {
  setTheme: (theme: Theme) => void
  setLocale: (locale: AppLocale) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function readSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { theme: 'light', locale: 'pt-BR' }
    const parsed = JSON.parse(raw) as Partial<SettingsState>
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      locale: parsed.locale === 'en' ? 'en' : 'pt-BR',
    }
  } catch {
    return { theme: 'light', locale: 'pt-BR' }
  }
}

function persistSettings(state: SettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function SettingsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<SettingsState>(() => readSettings())

  useEffect(() => {
    applyTheme(state.theme)
    void i18n.changeLanguage(state.locale)
    persistSettings(state)
  }, [state])

  const setTheme = useCallback((theme: Theme) => {
    setState((current) => ({ ...current, theme }))
  }, [])

  const setLocale = useCallback((locale: AppLocale) => {
    setState((current) => ({ ...current, locale }))
  }, [])

  const value = useMemo(
    () => ({ ...state, setTheme, setLocale }),
    [state, setTheme, setLocale],
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
