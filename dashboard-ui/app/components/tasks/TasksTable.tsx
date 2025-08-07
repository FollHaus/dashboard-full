'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/ui/Button/Button'
import { TaskService } from '@/services/task/task.service'
import { ITask, TaskPriority } from '@/shared/interfaces/task.interface'

const TasksTable = () => {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    TaskService.getAll()
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = tasks.filter(task => {
    const matchesDate = !date || task.deadline.slice(0, 10) === date
    const matchesPriority = !priority || task.priority === priority
    return matchesDate && matchesPriority
  })

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          >
            <option value="">Все приоритеты</option>
            {Object.values(TaskPriority).map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <Link href="/tasks/new">
          <Button className="bg-primary-500 text-white px-4 py-1">
            Добавить задачу
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-4 text-center">Loading...</div>
      ) : (
        <table className="min-w-full bg-neutral-100 rounded shadow-md">
          <thead>
            <tr className="text-left border-b border-neutral-300">
              <th className="p-2">Задача</th>
              <th className="p-2">Исполнитель</th>
              <th className="p-2">Дедлайн</th>
              <th className="p-2">Приоритет</th>
              <th className="p-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <tr
                key={task.id}
                className="border-b border-neutral-200 hover:bg-neutral-200"
              >
                <td className="p-2">
                  <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                </td>
                <td className="p-2">{task.executor || '-'}</td>
                <td className="p-2">
                  {new Date(task.deadline).toLocaleDateString()}
                </td>
                <td className="p-2">{task.priority}</td>
                <td className="p-2">{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  )
}

export default TasksTable
