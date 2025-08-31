'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'

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
        <button
          type="button"
          aria-label="Добавить задачу"
          title="Добавить задачу"
          onClick={openAddTaskModal}
          ref={fabRef}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-card flex items-center justify-center cursor-pointer bg-success text-neutral-50 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-success"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </>
  )
}

export default TasksContent
