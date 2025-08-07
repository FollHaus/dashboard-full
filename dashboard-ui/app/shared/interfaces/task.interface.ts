/*
Модель задачи
deadline - срок выполнения
description - описание задачи
status - статус задачи
* */
export enum TaskStatus {
  Pending = 'Ожидает',
  InProgress = 'Выполняется',
  Completed = 'Готово',
}

export enum TaskPriority {
  Low = 'Низкий',
  Medium = 'Средний',
  High = 'Высокий',
}

export interface ITask {
  id: number
  title: string
  description?: string
  deadline: string
  status: TaskStatus
  executor?: string
  priority: TaskPriority
}
