'use client'

import { useEffect, useState } from 'react'
import Layout from '@/ui/Layout'
import TaskForm from '@/components/tasks/TaskForm'
import { TaskService } from '@/services/task/task.service'
import { ITask } from '@/shared/interfaces/task.interface'

interface Props {
  params: { id: string }
}

export default function TaskPage({ params }: Props) {
  const [task, setTask] = useState<ITask | null>(null)

  useEffect(() => {
    TaskService.getById(params.id).then(setTask)
  }, [params.id])

  if (!task)
    return (
      <Layout>
        <div>Загрузка...</div>
      </Layout>
    )

  return (
    <Layout>
      <TaskForm task={task} />
    </Layout>
  )
}
