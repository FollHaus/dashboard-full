import { IInventory } from '@/shared/interfaces/inventory.interface'

export const DEFAULT_MIN_STOCK = 3

export const isLowStock = (
  remains: number,
  minStock: number | undefined | null,
  fallback = DEFAULT_MIN_STOCK,
) =>
  remains <=
  (Number.isFinite(minStock as number) ? (minStock as number) : fallback)

export function stockTone(
  remains: number,
  minStock: number | undefined | null,
  fallback = DEFAULT_MIN_STOCK,
) {
  const min = Number.isFinite(minStock as number)
    ? (minStock as number)
    : fallback
  if (remains < min) return 'bg-red-50 text-red-700'
  if (remains === min) return 'bg-orange-50 text-orange-700'
  return 'bg-green-50 text-green-700'
}

export interface InventoryStats {
  outOfStock: number
  lowStock: number
  totalCount: number
  purchaseValue: number
  saleValue: number
}

export const calculateInventoryStats = (
  items: Pick<
    IInventory,
    'quantity' | 'minStock' | 'purchasePrice' | 'price'
  >[],
  fallback = DEFAULT_MIN_STOCK,
): InventoryStats => {
  const outOfStock = items.filter(it => it.quantity === 0).length
  const lowStock = items.filter(
    it => it.quantity > 0 && isLowStock(it.quantity, it.minStock, fallback),
  ).length
  const totalCount = items.length
  const purchaseValue = items.reduce(
    (s, it) => s + it.quantity * (it.purchasePrice || 0),
    0,
  )
  const saleValue = items.reduce(
    (s, it) => s + it.quantity * (it.price || 0),
    0,
  )
  return { outOfStock, lowStock, totalCount, purchaseValue, saleValue }
}

export default calculateInventoryStats
