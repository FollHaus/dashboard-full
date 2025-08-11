import { http, HttpResponse } from 'msw'
import { ITask } from '@/shared/interfaces/task.interface'

export const mockTasks: ITask[] = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Desc',
    executor: 'John',
    deadline: '2024-01-01',
    priority: 'Высокий',
    status: 'Ожидает',
  },
]

export const handlers = [
  http.get('http://localhost:4000/api/task', () => {
    return HttpResponse.json(mockTasks)
  }),
  http.delete('http://localhost:4000/api/task/:id', () => {
    return HttpResponse.json({})
  }),
]
