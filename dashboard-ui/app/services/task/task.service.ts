import axios from '../../api/interceptor'
import { ITask } from '@/shared/interfaces/task.interface'

export const TaskService = {
  /**
   * GET /task
   * Получение всех задач.
   */
  async getAll() {
    const response = await axios.get<ITask[]>('/task')
    return response.data
  },

  /**
   * GET /task/:id
   * Получение одной задачи по идентификатору.
   */
  async getById(id: string | number) {
    const response = await axios.get<ITask>(`/task/${id}`)
    return response.data
  },

  /**
   * POST /task
   * Создание новой задачи.
   */
  async create(data: Omit<ITask, 'id'>) {
    const response = await axios.post<ITask>('/task', data)
    return response.data
  },

  /**
   * PUT /task/:id
   * Обновление существующей задачи.
   */
  async update(id: string | number, data: Partial<ITask>) {
    const response = await axios.put<ITask>(`/task/${id}`, data)
    return response.data
  },

  /**
   * DELETE /task/:id
   * Удаление задачи.
   */
  async delete(id: number) {
    await axios.delete(`/task/${id}`)
  },
}
