import { describe, it, expect } from 'vitest'
import { calculateInventoryStats } from './inventoryStats'

describe('calculateInventoryStats', () => {
  it('calculates out of stock and low stock counts', () => {
    const stats = calculateInventoryStats([
      { quantity: 0 },
      { quantity: 1, minStock: 2 },
      { quantity: 3, minStock: 2 },
      { quantity: 1 },
    ])
    expect(stats.outOfStock).toBe(1)
    expect(stats.lowStock).toBe(2)
  })
})
