import { describe, it, expect } from 'vitest'
import { calculateInventoryStats, stockTone } from './inventoryStats'

describe('calculateInventoryStats', () => {
  it('calculates out of stock and low stock counts', () => {
    const stats = calculateInventoryStats([
      { quantity: 0 },
      { quantity: 1, minStock: 2 },
      { quantity: 3, minStock: 2 },
      { quantity: 3 },
      { quantity: 1 },
    ])
    expect(stats.outOfStock).toBe(1)
    expect(stats.lowStock).toBe(3)
    expect(stats.totalCount).toBe(5)
    expect(stats.purchaseValue).toBe(0)
    expect(stats.saleValue).toBe(0)
  })
})

describe('stockTone', () => {
  it('returns color based on quantity and min stock', () => {
    expect(stockTone(5, 3)).toBe('bg-green-50 text-green-700')
    expect(stockTone(3, 3)).toBe('bg-orange-50 text-orange-700')
    expect(stockTone(2, 3)).toBe('bg-red-50 text-red-700')
    expect(stockTone(3, undefined)).toBe('bg-orange-50 text-orange-700')
  })
})
