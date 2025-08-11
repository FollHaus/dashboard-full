'use client'

import { FC } from 'react'

interface PeriodProps {
  start: string
  end: string
}

const TasksTab: FC<PeriodProps> = () => {
  const completed = 42
  const prevCompleted = 35
  const diff = completed - prevCompleted
  const isGrowth = diff >= 0

  return (
    <div
      className='p-4 bg-white rounded shadow cursor-pointer'
      onClick={() => alert('Open tasks details')}
    >
      <div className='font-medium'>Completed tasks</div>
      <div className='text-3xl font-semibold'>{completed}</div>
      <div className={`text-sm ${isGrowth ? 'text-green-600' : 'text-red-600'}`}>
        {isGrowth ? '+' : ''}{diff} from previous period
      </div>
    </div>
  )
}

export default TasksTab
