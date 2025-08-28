'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { HiDotsVertical } from 'react-icons/hi'

import Button from '@/ui/Button/Button'
import { TaskService } from '@/services/task/task.service'
import {
  ITask,
  TaskPriority,
  TaskStatus,
} from '@/shared/interfaces/task.interface'

const chipBase =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap'

const TasksTable = () => {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [menuId, setMenuId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    TaskService.getAll()
      .then(setTasks)
      .catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (menuId === null) return
    const handleClick = () => setMenuId(null)
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuId(null)
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [menuId])

  const handleDelete = async (id: number) => {
    try {
      await TaskService.delete(id)
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error deleting task')
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = tasks.filter(task => {
    const matchesDate = !date || task.deadline.slice(0, 10) === date
    const matchesPriority = !priority || task.priority === priority
    let matchesStatus = true
    if (status === 'В работе') matchesStatus = task.status === TaskStatus.InProgress
    else if (status === 'Завершённые') matchesStatus = task.status === TaskStatus.Completed
    else if (status === 'Просроченные') {
      const d = new Date(task.deadline)
      d.setHours(0, 0, 0, 0)
      matchesStatus = d < today && task.status !== TaskStatus.Completed
    }
    return matchesDate && matchesPriority && matchesStatus
  })

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
            aria-label="Фильтр по дате"
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
            aria-label="Фильтр по приоритету"
          >
            <option value="">Все приоритеты</option>
            {Object.values(TaskPriority).map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
            aria-label="Фильтр по статусу"
          >
            <option value="">Все</option>
            <option value="В работе">В работе</option>
            <option value="Просроченные">Просроченные</option>
            <option value="Завершённые">Завершённые</option>
          </select>
        </div>
        <Link href="/tasks/new" className="ml-auto">
          <Button className="rounded-2xl px-4 py-2 shadow-card bg-info text-neutral-50 hover:brightness-95 focus:ring-2 focus:ring-info">
            Добавить задачу
          </Button>
        </Link>
      </div>

      <table className="min-w-full bg-neutral-100 rounded shadow-md">
        <thead>
          <tr className="text-left border-b border-neutral-300">
            <th className="p-2">Задача</th>
            <th className="p-2">Исполнитель</th>
            <th className="p-2">Дедлайн</th>
            <th className="p-2">Приоритет</th>
            <th className="p-2">Статус</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {filtered.map(task => {
            const deadlineDate = new Date(task.deadline)
            deadlineDate.setHours(0, 0, 0, 0)
            const overdue = deadlineDate < today
            const todayMatch = deadlineDate.getTime() === today.getTime()
            const deadlineClasses = overdue
              ? 'text-error bg-error/5'
              : todayMatch
              ? 'text-warning'
              : ''

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

            const initials = task.executor
              ? task.executor
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .toUpperCase()
              : ''

            return (
              <tr
                key={task.id}
                className="border-b border-neutral-200 hover:bg-neutral-200/50 transition-colors odd:bg-neutral-100 even:bg-neutral-200"
              >
                <td className="p-2 max-w-[32ch] truncate" title={task.title}>
                  <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                </td>
                <td className="p-2">
                  {task.executor ? (
                    <div
                      className="w-6 h-6 rounded-full bg-neutral-300 text-neutral-900 text-xs font-semibold flex items-center justify-center"
                      title={task.executor}
                    >
                      {initials}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td
                  className={`p-2 ${deadlineClasses}`}
                  title={`Дедлайн: ${deadlineDate.toLocaleDateString('ru-RU')}`}
                >
                  {overdue && <span aria-hidden>⚠️</span>}{' '}
                  {deadlineDate.toLocaleDateString()}
                </td>
                <td className="p-2">
                  <span className={`${chipBase} ${priorityClasses[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-2">
                  <span className={`${chipBase} ${statusClasses[task.status]}`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-2 relative" onClick={e => e.stopPropagation()}>
                  <button
                    aria-haspopup="menu"
                    aria-label="Действия"
                    title="Действия"
                    onClick={e => {
                      e.stopPropagation()
                      setMenuId(task.id)
                    }}
                    className="p-1 rounded hover:bg-neutral-200"
                  >
                    <HiDotsVertical />
                  </button>
                  {menuId === task.id && (
                    <ul
                      role="menu"
                      className="absolute right-0 mt-1 w-32 bg-white border border-neutral-300 rounded shadow-md z-50"
                      onClick={e => e.stopPropagation()}
                    >
                      <li>
                        <Link
                          href={`/tasks/${task.id}`}
                          className="block px-4 py-2 hover:bg-neutral-100"
                          role="menuitem"
                        >
                          Редактировать
                        </Link>
                      </li>
                      <li>
                        <button
                          role="menuitem"
                          onClick={() => {
                            setMenuId(null)
                            setConfirmId(task.id)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-100"
                        >
                          Удалить
                        </button>
                      </li>
                    </ul>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {error && <p className="text-error mt-2">{error}</p>}
      {confirmId !== null &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setConfirmId(null)}
            role="dialog"
            aria-modal
          >
            <div
              className="bg-white p-4 rounded shadow-md"
              onClick={e => e.stopPropagation()}
            >
              <p className="mb-4">Удалить задачу?</p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setConfirmId(null)}
                >
                  Отмена
                </button>
                <button
                  className="px-3 py-1 bg-error text-white rounded"
                  onClick={async () => {
                    await handleDelete(confirmId)
                    setConfirmId(null)
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default TasksTable
