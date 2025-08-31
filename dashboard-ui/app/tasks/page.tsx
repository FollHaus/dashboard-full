import Layout from '@/ui/Layout'
import TasksContent from './TasksContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks',
}

export default function TasksPage() {
  return (
    <Layout>
      <TasksContent />
    </Layout>
  )
}
