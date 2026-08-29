import { assertValidPixKey, type PixKeyType } from '@/shared/mind-wallet/pixKey'

export type { PixKeyType }

export function isValidPixKey(type: PixKeyType, key: string): boolean {
  try {
    assertValidPixKey(type, key)
    return true
  } catch {
    return false
  }
}
