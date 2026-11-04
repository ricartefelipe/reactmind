import { describe, expect, it } from 'vitest'
import css from '../styles.css?raw'

// Lê os tokens de cada tema direto do CSS e confere o contraste mínimo (WCAG AA, texto normal: 4,5:1).

function tokens(tema: 'light' | 'dark'): Record<string, string> {
  const bloco = css.match(new RegExp(`html\\[data-theme='${tema}'\\]\\s*\\{([^}]*)\\}`))
  if (!bloco) throw new Error(`tema ${tema} não encontrado`)
  const mapa: Record<string, string> = {}
  for (const [, nome, valor] of bloco[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) mapa[nome] = valor.trim()
  const resolver = (v: string): string => {
    const ref = v.match(/^var\(--([\w-]+)\)$/)
    return ref ? resolver(mapa[ref[1]]) : v
  }
  for (const k of Object.keys(mapa)) mapa[k] = resolver(mapa[k])
  return mapa
}

function luminancia(hex: string): number {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const f = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

const pares: Array<[string, string[], Array<'light' | 'dark'>]> = [
  ['balance-text', ['balance-from', 'balance-mid', 'balance-to'], ['light', 'dark']],
  ['balance-label', ['balance-from', 'balance-mid', 'balance-to'], ['light', 'dark']],
  ['btn-text', ['btn-bg', 'btn-bg-hover'], ['light', 'dark']],
  ['success', ['bg', 'surface', 'surface-elevated'], ['light', 'dark']],
  ['danger', ['bg', 'surface', 'surface-elevated', 'danger-bg'], ['light', 'dark']],
]

describe('contraste dos tokens', () => {
  for (const [texto, fundos, temas] of pares) {
    for (const tema of temas) {
      it(`${texto} tem 4,5:1 sobre ${fundos.join(', ')} no tema ${tema}`, () => {
        const t = tokens(tema)
        for (const fundo of fundos) {
          expect(t[texto], `--${texto}`).toMatch(/^#[0-9a-f]{6}$/i)
          expect(t[fundo], `--${fundo}`).toMatch(/^#[0-9a-f]{6}$/i)
          expect(contraste(t[texto], t[fundo]), `--${texto} sobre --${fundo}`).toBeGreaterThanOrEqual(4.5)
        }
      })
    }
  }
})
