import Layout from '@/ui/Layout'
import TaskForm from '@/components/tasks/TaskForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Task',
}

export default function NewTaskPage() {
  return (
    <Layout>
      <TaskForm />
    </Layout>
  )
}
