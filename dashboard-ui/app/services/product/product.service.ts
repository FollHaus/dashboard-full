import { axiosClassic } from '@/api/interceptor'
import { IProduct } from '@/shared/interfaces/product.interface'

// Сервис для взаимодействия с продуктами склада
export const ProductService = {
  /**
   * GET /products
   * Получение всех продуктов со склада.
   */
  async getAll() {
    const response = await axiosClassic.get<IProduct[]>('/products')
    return response.data
  },

  /**
   * GET /products/:id
   * Получение одного продукта по ID.
   */
  async getById(id: number) {
    const response = await axiosClassic.get<IProduct>(`/products/${id}`)
    return response.data
  },

  /**
   * POST /products
   * Создание нового продукта.
   */
  async create(data: Omit<IProduct, 'id'>) {
    const response = await axiosClassic.post<IProduct>('/products', data)
    return response.data
  },

  /**
   * PUT /products/:id
   * Обновление данных продукта.
   */
  async update(id: number, data: Partial<IProduct>) {
    const response = await axiosClassic.put<IProduct>(`/products/${id}`, data)
    return response.data
  },

  /**
   * DELETE /products/:id
   * Удаление продукта.
   */
  async delete(id: number) {
    await axiosClassic.delete(`/products/${id}`)
  },

  /**
   * POST /products/:id/stock
   * Увеличение остатка (приход на склад).
   */
  async addStock(id: number, qty: number) {
    const response = await axiosClassic.post(`/products/${id}/stock`, { qty })
    return response.data
  },
}
