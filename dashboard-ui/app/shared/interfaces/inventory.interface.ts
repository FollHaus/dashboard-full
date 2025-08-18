import { ICategory } from './category.interface'

export interface IInventory {
  id: number
  name: string
  code: string
  quantity: number
  /** Цена продажи */
  price: number
  /** Закупочная цена */
  purchasePrice: number
  /** Минимальный остаток для уведомления */
  minStock?: number
  status?: string
  updatedAt?: string
  category?: ICategory
}

export interface InventoryStats {
  outOfStock: number
  lowStock: number
}

export interface InventoryList {
  items: IInventory[]
  total: number
  page: number
  pageSize: number
  stats: InventoryStats
}
