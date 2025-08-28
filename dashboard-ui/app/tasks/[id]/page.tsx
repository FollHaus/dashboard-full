'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/ui/Layout'
import TaskForm from '@/components/tasks/TaskForm'
import Modal from '@/ui/Modal/Modal'
import { TaskService } from '@/services/task/task.service'
import { ITask } from '@/shared/interfaces/task.interface'

interface Props {
  params: { id: string }
}

export default function TaskPage({ params }: Props) {
  const [task, setTask] = useState<ITask | null>(null)
  const router = useRouter()

  useEffect(() => {
    TaskService.getById(params.id).then(setTask)
  }, [params.id])

  const onClose = () => router.push('/tasks')

  return (
    <Layout>
      <Modal isOpen onClose={onClose} ariaLabelledby="task-form-title">
        {task ? <TaskForm task={task} /> : <div>Загрузка...</div>}
      </Modal>
    </Layout>
  )
}
