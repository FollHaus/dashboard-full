import { describe, it, expect } from 'vitest'
import formatCurrency from './formatCurrency'

describe('formatCurrency', () => {
  it('formats number to RUB currency', () => {
    const value = 1234.5
    expect(formatCurrency(value)).toBe(
      new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
      }).format(value),
    )
  })

  it('formats number to compact RUB currency', () => {
    const value = 1234.5
    expect(formatCurrency(value, { compact: true })).toBe(
      new Intl.NumberFormat('ru-RU', {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value) + ' ₽',
    )
  })
})
