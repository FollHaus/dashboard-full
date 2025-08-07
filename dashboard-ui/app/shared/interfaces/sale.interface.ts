import { IProduct } from '@/shared/interfaces/product.interface'

/*
Модель продажи
date - дата продажи
productId - id продукта
count - количество проданного
sum - сумма продажи
* */
export interface ISale {
  id: number
  date: Date
  productId: number
  product: IProduct
  count: number
  sum: number
}
