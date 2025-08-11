'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { TaskService } from '@/services/task/task.service'
import { ITask } from '@/shared/interfaces/task.interface'

const TaskList = () => {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    TaskService.getAll()
      .then(allTasks => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)
        nextWeek.setHours(23, 59, 59, 999)
        const filtered = allTasks.filter(task => {
          const deadline = new Date(task.deadline)
          return deadline >= today && deadline <= nextWeek
        })
        setTasks(filtered)
      })
      .catch(e => setError(e.message))
  }, [])

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Задачи на ближайшую неделю</h3>
        <Link href="/tasks" className="text-sm text-primary-600">
          Показать все
        </Link>
      </div>
      {error && <div className="text-error text-sm mb-2">{error}</div>}
      {tasks.length === 0 ? (
        <p className="text-sm text-neutral-500">Нет задач с дедлайном в ближайшие 7 дней.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li
              key={task.id}
              className="flex justify-between border-l-4 border-primary-500 pl-2 text-neutral-900"
            >
              <span>{task.title}</span>
              <span className="text-sm text-neutral-600">
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TaskList

