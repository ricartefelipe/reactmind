import { describe, expect, it } from 'vitest'
import { isValidPixKey } from './pixKey'

describe('regras de chave PIX', () => {
  it('CPF confere os dígitos verificadores', () => {
    expect(isValidPixKey('CPF', '52998224725')).toBe(true)
    expect(isValidPixKey('CPF', '52998224724')).toBe(false)
    expect(isValidPixKey('CPF', '11111111111')).toBe(false)
  })

  it('CNPJ aceita numérico e alfanumérico com dígitos válidos', () => {
    expect(isValidPixKey('CNPJ', '11222333000181')).toBe(true)
    expect(isValidPixKey('CNPJ', '12ABC34501DE35')).toBe(true)
    expect(isValidPixKey('CNPJ', '11222333000182')).toBe(false)
    expect(isValidPixKey('CNPJ', '11.222.333/0001-81')).toBe(false)
  })

  it('CNPJ não passa como CPF nem como chave aleatória', () => {
    expect(isValidPixKey('CPF', '11222333000181')).toBe(false)
    expect(isValidPixKey('RANDOM', '11222333000181')).toBe(false)
  })

  it('chave aleatória é um UUID, com ou sem hífens', () => {
    expect(isValidPixKey('RANDOM', '123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(isValidPixKey('RANDOM', 'a1b2c3d4e5f6789012345678abcdef01')).toBe(true)
    expect(isValidPixKey('RANDOM', 'chave-aleatoria')).toBe(false)
  })

  it('e-mail e telefone', () => {
    expect(isValidPixKey('EMAIL', 'ana@email.com')).toBe(true)
    expect(isValidPixKey('EMAIL', 'ana@email')).toBe(false)
    expect(isValidPixKey('PHONE', '+5511999998888')).toBe(true)
  })
})
