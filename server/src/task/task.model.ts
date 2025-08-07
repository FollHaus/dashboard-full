import { Column, DataType, Model, Table } from 'sequelize-typescript'

export enum TaskStatus {
        Pending = 'Ожидает',
        InProgress = 'Выполняется',
        Completed = 'Готово'
}

export enum TaskPriority {
        Low = 'Низкий',
        Medium = 'Средний',
        High = 'Высокий'
}

@Table({
        tableName: 'Task',
        deletedAt: false,
        version: false,
        indexes: [
                { fields: ['deadline'] },
                { fields: ['status'] },
                { fields: ['priority'] }
        ]
})
export class TaskModel extends Model {
	@Column(DataType.TEXT)
	title: string // Заголовок задачи

	@Column(DataType.TEXT)
	description?: string // Описание задачи

        @Column(DataType.DATE)
        deadline: Date // Дедлайн задачи

        @Column({
                type: DataType.ENUM(...Object.values(TaskStatus)),
                defaultValue: TaskStatus.Pending
        })
        status: TaskStatus // Статус задачи

        @Column({
                type: DataType.ENUM(...Object.values(TaskPriority)),
                defaultValue: TaskPriority.Medium
        })
        priority: TaskPriority // Приоритет задачи

        @Column(DataType.STRING)
        executor?: string // Исполнитель задачи
}
