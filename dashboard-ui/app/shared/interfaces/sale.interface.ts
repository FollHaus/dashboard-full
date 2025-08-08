import { IProduct } from '@/shared/interfaces/product.interface'

/*
Модель продажи
saleDate - дата продажи в формате строки
productId - id продукта
product - связанный продукт (может быть опционален)
quantitySold - количество проданного
totalPrice - сумма продажи
*/
export interface ISale {
  id: number
  saleDate: string
  productId: number
  product?: IProduct
  quantitySold: number
  totalPrice: number
}
