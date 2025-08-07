import { axiosClassic } from '@/api/interceptor'
import { ITask } from '@/shared/interfaces/task.interface'

export const TaskService = {
  async getAll() {
    const response = await axiosClassic.get<ITask[]>('/task')
    return response.data
  },

  async getById(id: string | number) {
    const response = await axiosClassic.get<ITask>(`/task/${id}`)
    return response.data
  },

  async create(data: Omit<ITask, 'id'>) {
    const response = await axiosClassic.post<ITask>('/task', data)
    return response.data
  },

  async update(id: string | number, data: Partial<ITask>) {
    const response = await axiosClassic.put<ITask>(`/task/${id}`, data)
    return response.data
  },

  async delete(id: number) {
    await axiosClassic.delete(`/task/${id}`)
  },
}
