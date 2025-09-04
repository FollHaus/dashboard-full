import { safePct, formatTick } from './utils'
import { describe, it, expect } from 'vitest'

describe('safePct', () => {
  it('returns 0 when total is 0', () => {
    expect(safePct(5, 0)).toBe(0)
    expect(safePct(0, 0)).toBe(0)
  })

  it('calculates percentage correctly', () => {
    expect(safePct(1, 10)).toBe(10)
  })
})

describe('formatTick', () => {
  const date = new Date('2024-05-15T15:00:00Z').toISOString()

  it('formats day period as HH:MM', () => {
    expect(formatTick(date, 'day')).toMatch(/\d{2}:\d{2}/)
  })

  it('formats week period as dd MMM', () => {
    expect(formatTick(date, 'week')).toMatch(/\d{2} \D+/)
  })

  it('formats year period as MMM', () => {
    expect(formatTick(date, 'year')).toMatch(/\D+/)
  })
})
