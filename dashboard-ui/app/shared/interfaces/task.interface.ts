/*
Модель задачи
title - заголовок задачи
description - описание задачи
executor - исполнитель задачи
deadline - срок выполнения
status - статус задачи
priority - приоритет выполнения
*/
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
