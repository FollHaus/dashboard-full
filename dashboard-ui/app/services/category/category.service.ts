import axios from '../../api/interceptor'
import { ICategory } from '@/shared/interfaces/category.interface'

// Сервис для взаимодействия с категориями
export const CategoryService = {
  /**
   * GET /category
   * Получение всех категорий.
   */
  async getAll() {
    const response = await axios.get<ICategory[]>('/category')
    return response.data
  },
}
