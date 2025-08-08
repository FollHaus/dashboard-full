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
  async create(
    data: Omit<IProduct, 'id' | 'category'> & {
      categoryId?: number
      categoryName?: string
    }
  ) {
    const payload: Record<string, any> = {
      name: data.name,
      articleNumber: data.articleNumber,
      purchasePrice: data.purchasePrice,
      salePrice: data.salePrice,
      remains: data.remains,
    }
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId
    if (data.categoryName !== undefined) payload.categoryName = data.categoryName
    const response = await axiosClassic.post<IProduct>('/products', payload)
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
