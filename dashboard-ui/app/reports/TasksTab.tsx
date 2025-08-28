'use client'

import { FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TaskService } from '@/services/task/task.service'
import { ITask, TaskStatus } from '@/shared/interfaces/task.interface'

interface Filters {
  from: string
  to: string
}

interface Props {
  filters: Filters
}

const TasksTab: FC<Props> = ({ filters }) => {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery<ITask[], Error>({
    queryKey: ['reports', 'tasks', filters],
    queryFn: () => TaskService.getAll({ start: filters.from, end: filters.to }),
    enabled: Boolean(filters.from && filters.to),
  })

  const completed = tasks?.filter(t => t.status === TaskStatus.Completed).length ?? 0
  const overdue =
    tasks?.filter(
      t =>
        t.status !== TaskStatus.Completed &&
        new Date(t.deadline) < new Date(),
    ).length ?? 0

  return (
    <div className='space-y-6'>
      {isLoading ? (
        <div className='text-sm text-neutral-500'>Загрузка...</div>
      ) : error ? (
        <div className='text-sm text-red-600'>
          Ошибка{' '}
          <button className='underline' onClick={() => refetch()}>
            Повторить
          </button>
        </div>
      ) : (
        <div className='flex gap-4'>
          <div className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
            <div className='text-sm'>Выполненные</div>
            <div className='text-2xl font-semibold'>{completed}</div>
          </div>
          <div className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
            <div className='text-sm'>Просроченные</div>
            <div className='text-2xl font-semibold'>{overdue}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TasksTab

