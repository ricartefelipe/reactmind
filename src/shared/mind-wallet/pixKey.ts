export type PixKeyType = 'EMAIL' | 'CPF' | 'PHONE' | 'RANDOM'

const CPF_PATTERN = /^\d{11}$/
const PHONE_PATTERN = /^\+?\d{10,13}$/
const RANDOM_PATTERN = /^[0-9a-fA-F]{32}$/

function isValidEmail(key: string): boolean {
  if (key.includes(' ')) return false
  const at = key.indexOf('@')
  if (at < 1) return false
  const domain = key.slice(at + 1)
  const dot = domain.indexOf('.')
  return dot > 0 && dot < domain.length - 1
}

function isValidPixKey(type: PixKeyType, key: string): boolean {
  switch (type) {
    case 'EMAIL':
      return isValidEmail(key)
    case 'CPF':
      return CPF_PATTERN.test(key)
    case 'PHONE':
      return PHONE_PATTERN.test(key)
    case 'RANDOM':
      return RANDOM_PATTERN.test(key)
    default: {
      const _exhaustive: never = type
      return _exhaustive
    }
  }
}

export function assertValidPixKey(type: PixKeyType, key: string): void {
  if (!isValidPixKey(type, key)) {
    throw new Error(`INVALID_PIX_KEY: chave PIX inválida para o tipo ${type}.`)
  }
}
