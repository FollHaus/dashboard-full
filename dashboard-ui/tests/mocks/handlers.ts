import { http, HttpResponse } from 'msw'
import { ITask } from '@/shared/interfaces/task.interface'
import { IProduct } from '@/shared/interfaces/product.interface'

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

export const mockProducts: IProduct[] = [
  {
    id: 1,
    name: 'Product 1',
    articleNumber: 'A1',
    purchasePrice: 10,
    salePrice: 20,
    remains: 5,
    minStock: 5,
  },
  {
    id: 2,
    name: 'Second',
    articleNumber: 'B2',
    purchasePrice: 8,
    salePrice: 15,
    remains: 2,
    minStock: 3,
  },
]

export const handlers = [
  http.get('http://localhost:4000/api/task', () => {
    return HttpResponse.json(mockTasks)
  }),
  http.delete('http://localhost:4000/api/task/:id', () => {
    return HttpResponse.json({})
  }),
  http.get('http://localhost:4000/api/products', () => {
    return HttpResponse.json(mockProducts)
  }),
  http.delete('http://localhost:4000/api/products/:id', () => {
    return HttpResponse.json({})
  }),
]
