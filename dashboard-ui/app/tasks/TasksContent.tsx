'use client'

import TaskFiltersToolbar from '@/components/tasks/TaskFiltersToolbar'
import TasksTable from '@/components/tasks/TasksTable'
import { useTaskFilters } from '@/hooks/useTaskFilters'

const TasksContent = () => {
  const { filters, setFilters } = useTaskFilters()
  return (
    <>
      <TaskFiltersToolbar filters={filters} setFilters={setFilters} />
      <TasksTable filters={filters} />
    </>
  )
}

export default TasksContent
