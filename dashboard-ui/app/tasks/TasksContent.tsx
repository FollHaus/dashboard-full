'use client'

import { useRef, useState } from 'react'
import Fab from '@/components/ui/Fab'

import TaskFiltersToolbar from '@/components/tasks/TaskFiltersToolbar'
import TasksTable from '@/components/tasks/TasksTable'
import { useTaskFilters } from '@/hooks/useTaskFilters'

const TasksContent = () => {
  const { filters, setFilters } = useTaskFilters()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const fabRef = useRef<HTMLButtonElement | null>(null)

  const openAddTaskModal = () => setIsAddOpen(true)
  const closeAddTaskModal = () => {
    setIsAddOpen(false)
    fabRef.current?.focus()
  }

  return (
    <>
      <TaskFiltersToolbar filters={filters} setFilters={setFilters} />
      <TasksTable
        filters={filters}
        isAddOpen={isAddOpen}
        onCloseAdd={closeAddTaskModal}
      />
      {!isAddOpen && (
        <Fab
          ref={fabRef}
          aria-label="Добавить задачу"
          title="Добавить задачу"
          onClick={openAddTaskModal}
        />
      )}
    </>
  )
}

export default TasksContent
