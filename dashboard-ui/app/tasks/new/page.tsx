"use client"

import { useRouter } from 'next/navigation'
import Layout from '@/ui/Layout'
import TaskForm from '@/components/tasks/TaskForm'
import Modal from '@/ui/Modal/Modal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Task',
}

export default function NewTaskPage() {
  const router = useRouter()
  return (
    <Layout>
      <Modal isOpen onClose={() => router.push('/tasks')} ariaLabelledby="task-form-title">
        <TaskForm />
      </Modal>
    </Layout>
  )
}
