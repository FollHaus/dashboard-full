import { IInventory } from '@/shared/interfaces/inventory.interface'

export const DEFAULT_LOW_STOCK = 2

export interface InventoryStats {
  outOfStock: number
  lowStock: number
}

export const calculateInventoryStats = (
  items: Pick<IInventory, 'quantity' | 'minStock'>[],
  defaultLowStock = DEFAULT_LOW_STOCK,
): InventoryStats => {
  const outOfStock = items.filter(it => it.quantity === 0).length
  const lowStock = items.filter(
    it => it.quantity > 0 && it.quantity <= (it.minStock ?? defaultLowStock),
  ).length
  return { outOfStock, lowStock }
}

export default calculateInventoryStats
