'use client'

import { FC } from 'react'

interface TasksTabProps {
  completed: number
  prevCompleted: number
}

const TasksTab: FC<TasksTabProps> = ({ completed, prevCompleted }) => {
  const diff = completed - prevCompleted
  const isGrowth = diff >= 0

  return (
    <div
      className='p-4 bg-white rounded shadow cursor-pointer'
      onClick={() => alert('Открыть задачи')}
    >
      <div className='font-medium'>Выполненные задачи</div>
      <div className='text-3xl font-semibold'>{completed}</div>
      <div className={`text-sm ${isGrowth ? 'text-green-600' : 'text-red-600'}`}>
        {isGrowth ? '+' : ''}{diff} от предыдущего периода
      </div>
    </div>
  )
}

export default TasksTab
