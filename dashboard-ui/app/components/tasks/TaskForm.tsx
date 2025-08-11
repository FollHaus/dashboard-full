'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Field from '@/ui/Field/Field'
import TextArea from '@/ui/TextArea/TextArea'
import Button from '@/ui/Button/Button'
import {
  ITask,
  TaskPriority,
  TaskStatus,
} from '@/shared/interfaces/task.interface'
import { TaskService } from '@/services/task/task.service'

interface Props {
  task?: ITask
}

const TaskForm = ({ task }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITask>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      executor: task?.executor || '',
      deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
      priority: task?.priority || TaskPriority.Medium,
      status: task?.status || TaskStatus.Pending,
    },
  })

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (data: ITask) => {
    const method = task
      ? TaskService.update(task.id, data)
      : TaskService.create(data)
    method
      .then(() => router.push('/tasks'))
      .catch(e => setError(e.message))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <Field
        {...register('title', { required: 'Введите заголовок' })}
        placeholder="Заголовок"
        error={errors.title}
      />
      <TextArea
        {...register('description')}
        placeholder="Описание"
      />
      <Field
        {...register('executor')}
        placeholder="Исполнитель"
      />
      <div>
        <label className="block mb-1">Дедлайн</label>
        <Field
          type="date"
          min={new Date().toISOString().split('T')[0]}
          {...register('deadline', {
            required: 'Укажите дату',
            validate: value => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return new Date(value) >= today || 'Дата не может быть в прошлом'
            },
          })}
          error={errors.deadline}
        />
      </div>
      <div>
        <label className="block mb-1">Приоритет</label>
        <select
          {...register('priority')}
          className="border border-neutral-300 rounded px-2 py-1 w-full"
        >
          {Object.values(TaskPriority).map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Статус</label>
        <select
          {...register('status')}
          className="border border-neutral-300 rounded px-2 py-1 w-full"
        >
          {Object.values(TaskStatus).map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        className="bg-primary-500 text-white px-4 py-1"
      >
        Сохранить
      </Button>
      {error && <p className="text-error">{error}</p>}
    </form>
  )
}

export default TaskForm
