'use client'

import { useDashboardFilter } from '@/store/dashboardFilter'
import TaskStatusChart from './tasks/TaskStatusChart'
import TaskTrendChart from './tasks/TaskTrendChart'
import { useTaskStatusSummary } from '@/hooks/useTaskStatusSummary'
import { useTaskTrend } from '@/hooks/useTaskTrend'

export default function TasksTab() {
  const { filter } = useDashboardFilter()
  const { data: summary } = useTaskStatusSummary(filter)
  const { data: trend } = useTaskTrend(filter)

  return (
    <section className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <TaskStatusChart
          summary={{
            completed: summary?.completed ?? 0,
            inProgress: summary?.inProgress ?? 0,
            pending: summary?.pending ?? 0,
            overdue: summary?.overdue ?? 0,
          }}
        />
        <TaskTrendChart data={trend ?? []} period={filter.period} />
      </div>
    </section>
  )
}
