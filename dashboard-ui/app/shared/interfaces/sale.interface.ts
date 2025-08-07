import { IProduct } from '@/shared/interfaces/product.interface'

/*
Модель продажи
saleDate - дата продажи
productId - id продукта
quantitySold - количество проданного
totalPrice - сумма продажи
* */
export interface ISale {
  id: number
  saleDate: Date
  productId: number
  product: IProduct
  quantitySold: number
  totalPrice: number
}
