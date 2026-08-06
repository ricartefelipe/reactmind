import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import ptBR from './locales/pt-BR'

export type AppLocale = 'pt-BR' | 'en'

const STORAGE_KEY = 'reactmind.settings'

export function readStoredLocale(): AppLocale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 'pt-BR'
    const parsed = JSON.parse(raw) as { locale?: string }
    return parsed.locale === 'en' ? 'en' : 'pt-BR'
  } catch {
    return 'pt-BR'
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
  },
  lng: readStoredLocale(),
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
})

export default i18n
