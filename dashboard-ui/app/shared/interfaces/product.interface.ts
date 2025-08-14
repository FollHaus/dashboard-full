/*
Модель продукта
name - название
category - категория
articleNumber - артикул
purchasePrice - закупочная цена
salePrice - продажная цена
remains - остаток
* */

import { ICategory } from './category.interface'

export interface IProduct {
  id: number
  name: string
  articleNumber: string
  purchasePrice: number
  salePrice: number
  remains: number
  minStock?: number
  // Связанная категория может приходить из бэкенда
  category?: ICategory
}

// Данные для создания или обновления продукта
export interface IProductCreate {
  name: string
  categoryId?: number
  categoryName?: string
  articleNumber: string
  purchasePrice: number
  salePrice: number
  remains: number
  minStock?: number
}
