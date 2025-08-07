import { axiosClassic } from '@/api/interceptor'
import { IProduct } from '@/shared/interfaces/product.interface'

// Сервис для взаимодействия с продуктами склада
export const ProductService = {
  /** Получение всех продуктов */
  async getAll() {
    const response = await axiosClassic.get<IProduct[]>('/products')
    return response.data
  },

  /** Получение одного продукта по ID */
  async getById(id: number) {
    const response = await axiosClassic.get<IProduct>(`/products/${id}`)
    return response.data
  },

  /** Создание нового продукта */
  async create(data: Omit<IProduct, 'id'>) {
    const response = await axiosClassic.post<IProduct>('/products', data)
    return response.data
  },

  /** Обновление продукта */
  async update(id: number, data: Partial<IProduct>) {
    const response = await axiosClassic.put<IProduct>(`/products/${id}`, data)
    return response.data
  },

  /** Удаление продукта */
  async delete(id: number) {
    await axiosClassic.delete(`/products/${id}`)
  },

  /** Увеличение остатка (приход на склад) */
  async addStock(id: number, qty: number) {
    const response = await axiosClassic.post(`/products/${id}/stock`, { qty })
    return response.data
  },
}
