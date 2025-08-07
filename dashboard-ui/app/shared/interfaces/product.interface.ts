/*
Модель продукта
name - название
category - категория
articleNumber - артикул
purchasePrice - закупочная цена
salePrice - продажная цена
remains - остаток
* */

export interface IProduct {
  id: number
  name: string
  categoryId: number
  articleNumber: string
  purchasePrice: number
  salePrice: number
  remains: number
}
