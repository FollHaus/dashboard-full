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

export interface ITask {
  id: string
  title: string
  description?: string
  deadline: Date
  status: TaskStatus
}
