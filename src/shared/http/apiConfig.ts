const DEFAULT_REMOTE_API =
  'https://54.94.163.136.sslip.io/wallet-api/api/v1'

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

export function shouldUseTotalRecallLogin(): boolean {
  return (
    import.meta.env.VITE_ENABLE_MSW === 'false' ||
    Boolean((import.meta.env.VITE_TOTALRECALL_URL as string | undefined)?.trim())
  )
}

export function defaultRemoteApiBaseUrl(): string {
  return DEFAULT_REMOTE_API
}
