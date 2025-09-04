import { useQuery } from '@tanstack/react-query'
import { TaskService } from '@/services/task/task.service'
import { ITask, TaskStatus } from '@/shared/interfaces/task.interface'
import { DashboardFilter } from '@/store/dashboardFilter'

function resolveRange(filter: DashboardFilter) {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)
  switch (filter.period) {
    case 'week':
      start.setDate(end.getDate() - 6)
      break
    case 'month':
      start = new Date(end.getFullYear(), end.getMonth(), 1)
      break
    case 'year':
      start = new Date(end.getFullYear(), 0, 1)
      break
    case 'range':
      start = filter.from ? new Date(filter.from) : start
      end = filter.to ? new Date(filter.to) : end
      break
    default:
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
  }
  return { start, end }
}

export function useTaskStatusSummary(filter: DashboardFilter) {
  return useQuery({
    queryKey: ['task-status-summary', filter],
    queryFn: async () => {
      const { start, end } = resolveRange(filter)
      const tasks = await TaskService.getAll({
        start: start.toISOString(),
        end: end.toISOString(),
      })
      const list: ITask[] = tasks ?? []
      const completed = list.filter(t => t.status === TaskStatus.Completed).length
      const inProgress = list.filter(t => t.status === TaskStatus.InProgress).length
      const pending = list.filter(t => t.status === TaskStatus.Pending).length
      const overdue = list.filter(
        t => t.status !== TaskStatus.Completed && t.deadline && new Date(t.deadline) < new Date(),
      ).length
      const total = Math.max(0, completed + inProgress + pending + overdue)
      return { total, completed, inProgress, pending, overdue }
    },
  })
}
