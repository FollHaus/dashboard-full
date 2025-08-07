import Layout from '@/ui/Layout'
import TasksTable from '@/components/tasks/TasksTable'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks',
}

export default function TasksPage() {
  return (
    <Layout>
      <TasksTable />
    </Layout>
  )
}
