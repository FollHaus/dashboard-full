import { useQuery } from '@tanstack/react-query'
import { TaskService } from '@/services/task/task.service'
import { ITask, TaskStatus } from '@/shared/interfaces/task.interface'
import { DashboardFilter } from '@/store/dashboardFilter'
import { TrendPoint } from '@/reports/tasks/TaskTrendChart'
import { Period } from '@/store/period'

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
      end = new Date(end.getFullYear(), 11, 31)
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

function makeBuckets(period: Period, start: Date, end: Date): Date[] {
  const buckets: Date[] = []
  if (period === 'day') {
    for (let h = 0; h < 24; h++) {
      const d = new Date(start)
      d.setHours(h, 0, 0, 0)
      buckets.push(d)
    }
  } else if (period === 'year') {
    for (let m = 0; m < 12; m++) {
      buckets.push(new Date(start.getFullYear(), m, 1))
    }
  } else {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      buckets.push(new Date(d))
    }
  }
  return buckets
}

function key(date: Date, period: Period): string {
  if (period === 'day') return date.toISOString().slice(0, 13)
  if (period === 'year') return `${date.getFullYear()}-${date.getMonth()}`
  return date.toISOString().split('T')[0]
}

export function useTaskTrend(filter: DashboardFilter) {
  return useQuery<TrendPoint[]>({
    queryKey: ['task-trend', filter],
    queryFn: async () => {
      const { start, end } = resolveRange(filter)
      const tasks = await TaskService.getAll({
        start: start.toISOString(),
        end: end.toISOString(),
      })
      const list: ITask[] = tasks ?? []
      const openedMap = new Map<string, number>()
      const closedMap = new Map<string, number>()
      const overdueMap = new Map<string, number>()
      list.forEach(t => {
        if (t.createdAt) {
          const k = key(new Date(t.createdAt), filter.period)
          openedMap.set(k, (openedMap.get(k) || 0) + 1)
        }
        if (t.status === TaskStatus.Completed && t.updatedAt) {
          const k = key(new Date(t.updatedAt), filter.period)
          closedMap.set(k, (closedMap.get(k) || 0) + 1)
        }
        if (t.status !== TaskStatus.Completed && t.deadline) {
          const d = new Date(t.deadline)
          if (d <= end) {
            const k = key(d, filter.period)
            overdueMap.set(k, (overdueMap.get(k) || 0) + 1)
          }
        }
      })
      const buckets = makeBuckets(filter.period, start, end)
      return buckets.map(b => {
        const k = key(b, filter.period)
        return {
          date: b.toISOString(),
          opened: openedMap.get(k) || 0,
          closed: closedMap.get(k) || 0,
          overdue: overdueMap.get(k) || 0,
        }
      })
    },
  })
}
