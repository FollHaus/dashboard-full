'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import {
  ITask,
  TaskPriority,
  TaskStatus,
} from '@/shared/interfaces/task.interface'
import { TaskService } from '@/services/task/task.service'
import { toast } from '@/utils/toast'

interface Props {
  task?: ITask
  onSuccess?: (task: ITask) => void
  onCancel?: () => void
}

const inputClasses =
  'w-full rounded-2xl border border-neutral-300 bg-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400'

const priorityClasses: Record<TaskPriority, string> = {
  [TaskPriority.High]: 'bg-error/10 text-error',
  [TaskPriority.Medium]: 'bg-warning/10 text-warning',
  [TaskPriority.Low]: 'bg-success/10 text-success',
}

const statusClasses: Record<TaskStatus, string> = {
  [TaskStatus.InProgress]: 'bg-info/10 text-info',
  [TaskStatus.Completed]: 'bg-success/10 text-success',
  [TaskStatus.Pending]: 'bg-neutral-300 text-neutral-900',
}

const TaskForm = ({ task, onSuccess, onCancel }: Props) => {
  const queryClient = useQueryClient()
  const [executors, setExecutors] = useState<string[]>([])

  useEffect(() => {
    TaskService.getAll().then(tasks => {
      const list = Array.from(
        new Set(tasks.map(t => t.executor).filter(Boolean) as string[]),
      )
      setExecutors(list)
    })
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<ITask>({
    mode: 'onChange',
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      executor: task?.executor || '',
      deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
      priority: task?.priority || TaskPriority.Medium,
      status: task?.status || TaskStatus.Pending,
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        executor: task.executor || '',
        deadline: task.deadline ? task.deadline.slice(0, 10) : '',
        priority: task.priority,
        status: task.status,
      })
      // ensure textarea height adjusts when editing
      setTimeout(autoResize, 0)
    }
  }, [task, reset])

  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const autoResize = () => {
    const el = descriptionRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  const onSubmit = async (data: ITask) => {
    const payload = {
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || '',
    }
    try {
      const res = task
        ? await TaskService.update(task.id, payload)
        : await TaskService.create(payload as Omit<ITask, 'id'>)
      toast.success(task ? 'Задача обновлена' : 'Задача создана')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onSuccess?.(res)
    } catch (e) {
      toast.error('Не удалось сохранить')
    }
  }

  const currentPriority = watch('priority')
  const currentStatus = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
      <h2
        id="task-form-title"
        className="text-lg md:text-xl font-semibold text-neutral-900 mb-3 md:mb-4"
      >
        {task ? 'Редактирование задачи' : 'Новая задача'}
      </h2>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-900">
          Название задачи
        </label>
        <input
          id="title"
          type="text"
          placeholder="Введите название задачи…"
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={inputClasses}
          {...register('title', {
            required: 'Название задачи должно содержать от 2 до 150 символов',
            minLength: {
              value: 2,
              message: 'Название задачи должно содержать от 2 до 150 символов',
            },
            maxLength: {
              value: 150,
              message: 'Название задачи должно содержать от 2 до 150 символов',
            },
            validate: value =>
              value.trim().length >= 2 ||
              'Название задачи должно содержать от 2 до 150 символов',
          })}
        />
        <p id="title-error" className="text-xs text-error mt-1 min-h-[1rem]">
          {errors.title?.message}
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-neutral-900"
        >
          Описание
        </label>
        <textarea
          id="description"
          placeholder="Опишите задачу (необязательно)…"
          className={cn(inputClasses, 'resize-none overflow-hidden')}
          rows={2}
          ref={e => {
            descriptionRef.current = e
          }}
          onInput={autoResize}
          {...register('description')}
        />
        <p className="text-xs text-error mt-1 min-h-[1rem]" />
      </div>

      <div>
        <label htmlFor="executor" className="block text-sm font-medium text-neutral-900">
          Исполнитель
        </label>
        <input
          id="executor"
          list="executor-list"
          className={inputClasses}
          {...register('executor')}
        />
        <datalist id="executor-list">
          {executors.map(ex => (
            <option key={ex} value={ex} />
          ))}
        </datalist>
        <p className="text-xs text-error mt-1 min-h-[1rem]" />
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-neutral-900">
          Дедлайн
        </label>
        <input
          id="deadline"
          type="date"
          lang="ru"
          min={new Date().toISOString().split('T')[0]}
          aria-invalid={errors.deadline ? 'true' : 'false'}
          aria-describedby={errors.deadline ? 'deadline-error' : undefined}
          className={inputClasses}
          {...register('deadline', {
            validate: value => {
              if (!value) return true
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return (
                new Date(value) >= today || 'Дата не может быть в прошлом'
              )
            },
          })}
        />
        <p id="deadline-error" className="text-xs text-error mt-1 min-h-[1rem]">
          {errors.deadline?.message}
        </p>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-neutral-900">
          Приоритет
        </label>
        <select
          id="priority"
          className={cn(inputClasses, priorityClasses[currentPriority])}
          {...register('priority')}
        >
          <option value={TaskPriority.High} className="bg-error/10 text-error">
            Высокий 🔴
          </option>
          <option value={TaskPriority.Medium} className="bg-warning/10 text-warning">
            Средний 🟡
          </option>
          <option value={TaskPriority.Low} className="bg-success/10 text-success">
            Низкий 🟢
          </option>
        </select>
        <p className="text-xs text-error mt-1 min-h-[1rem]" />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-neutral-900">
          Статус
        </label>
        <select
          id="status"
          className={cn(inputClasses, statusClasses[currentStatus])}
          {...register('status')}
        >
          <option value={TaskStatus.InProgress} className="bg-info/10 text-info">
            Выполняется 🔵
          </option>
          <option value={TaskStatus.Completed} className="bg-success/10 text-success">
            Готово 🟢
          </option>
          <option value={TaskStatus.Pending} className="bg-neutral-300 text-neutral-900">
            Ожидает ⚪
          </option>
        </select>
        <p className="text-xs text-error mt-1 min-h-[1rem]" />
      </div>

      <div className="flex gap-2 justify-end mt-4 md:mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl px-4 py-2 bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
          aria-label="Отмена"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="cursor-pointer inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-success text-neutral-50 font-medium shadow-card hover:brightness-95 focus:ring-2 focus:ring-success transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Сохранить"
        >
          {isSubmitting ? '...' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm

