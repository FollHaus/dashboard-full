import { IInventory } from '@/shared/interfaces/inventory.interface'

export const DEFAULT_MIN_STOCK = 2

export const isLowStock = (
  remains: number,
  minStock: number | undefined | null,
  fallback = DEFAULT_MIN_STOCK,
) =>
  remains <=
  (Number.isFinite(minStock as number) ? (minStock as number) : fallback)

export interface InventoryStats {
  outOfStock: number
  lowStock: number
}

export const calculateInventoryStats = (
  items: Pick<IInventory, 'quantity' | 'minStock'>[],
  fallback = DEFAULT_MIN_STOCK,
): InventoryStats => {
  const outOfStock = items.filter(it => it.quantity === 0).length
  const lowStock = items.filter(
    it => it.quantity > 0 && isLowStock(it.quantity, it.minStock, fallback),
  ).length
  return { outOfStock, lowStock }
}

export default calculateInventoryStats
