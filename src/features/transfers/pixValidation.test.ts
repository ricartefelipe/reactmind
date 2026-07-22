import { describe, expect, it } from 'vitest'
import { validatePixAmount } from './pixValidation'

describe('validatePixAmount', () => {
  it('aceita valor positivo dentro do saldo', () => {
    expect(validatePixAmount(1000, 250_000)).toBeNull()
  })

  it('rejeita valor <= 0', () => {
    expect(validatePixAmount(0, 250_000)).toBe('INVALID_AMOUNT')
  })

  it('rejeita saldo insuficiente', () => {
    expect(validatePixAmount(300_000, 250_000)).toBe('INSUFFICIENT_FUNDS')
  })
})
