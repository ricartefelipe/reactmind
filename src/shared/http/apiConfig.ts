export function apiBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}api/v1`
}

export function shouldEnableMsw(): boolean {
  const mswFlag = import.meta.env.VITE_ENABLE_MSW
  if (mswFlag === 'true') return true
  if (mswFlag === 'false') return false
  const hasRemoteApi = Boolean(
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim(),
  )
  if (hasRemoteApi) return false
  return import.meta.env.DEV || import.meta.env.BASE_URL !== '/'
}
