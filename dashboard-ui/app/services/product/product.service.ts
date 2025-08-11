import axios from '../../api/interceptor'
import {
  IProduct,
  IProductCreate,
} from '@/shared/interfaces/product.interface'

// Сервис для взаимодействия с продуктами склада
export const ProductService = {
  /**
   * GET /products
   * Получение всех продуктов со склада.
   */
  async getAll(signal?: AbortSignal) {
    const response = await axios.get<IProduct[]>('/products', { signal })
    return response.data
  },

  /**
   * GET /products/:id
   * Получение одного продукта по ID.
   */
  async getById(id: number, signal?: AbortSignal) {
    const response = await axios.get<IProduct>(`/products/${id}`, { signal })
    return response.data
  },

  /**
   * POST /products
   * Создание нового продукта.
   */
  async create(data: IProductCreate) {
    const response = await axios.post<IProduct>('/products', data)
    return response.data
  },

  /**
   * PUT /products/:id
   * Обновление данных продукта.
   */
  async update(id: number, data: Partial<IProductCreate>) {
    const response = await axios.put<IProduct>(`/products/${id}`, data)
    return response.data
  },

  /**
   * DELETE /products/:id
   * Удаление продукта.
   */
  async delete(id: number) {
    await axios.delete(`/products/${id}`)
  },

  /**
   * POST /products/:id/stock
   * Увеличение остатка (приход на склад).
   */
  async addStock(id: number, qty: number) {
    const response = await axios.post(`/products/${id}/stock`, { qty })
    return response.data
  },
}
