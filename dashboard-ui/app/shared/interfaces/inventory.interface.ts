import { ICategory } from './category.interface'

export interface IInventory {
  id: number
  name: string
  code: string
  quantity: number
  price: number
  status?: string
  updatedAt?: string
  category?: ICategory
}

export interface InventoryList {
  items: IInventory[]
  total: number
  page: number
  pageSize: number
}
