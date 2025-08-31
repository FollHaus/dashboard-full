'use client'

import { FC, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'

import { TaskService } from '@/services/task/task.service'
import { ITask, TaskStatus } from '@/shared/interfaces/task.interface'

interface Filters {
  from: string
  to: string
  preset: string
  categories: number[]
}

interface Props {
  filters: Filters
}

interface TaskWithDates extends ITask {
  createdAt: string
  updatedAt: string
}

const numberFmt = new Intl.NumberFormat('ru-RU')

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.InProgress]: '#3b82f6', // Выполняется
  [TaskStatus.Completed]: '#10b981', // Готово
  [TaskStatus.Pending]: '#9ca3af', // Ожидает
}

const TasksTab: FC<Props> = ({ filters }) => {
  const { data: tasks, isLoading, error, refetch } = useQuery<
    TaskWithDates[],
    Error
  >({
    queryKey: ['reports', 'tasks', filters],
    queryFn: () => TaskService.getAll({ start: filters.from, end: filters.to }),
    enabled: Boolean(filters.from && filters.to),
  })

  const {
    total,
    completed,
    overdue,
    inProgress,
    pieData,
    lineData,
    allZero,
  } = useMemo(() => {
    const list = tasks ?? []
    const total = list.length
    const completed = list.filter(t => t.status === TaskStatus.Completed).length
    const overdue = list.filter(
      t =>
        t.status !== TaskStatus.Completed &&
        new Date(t.deadline) < new Date(),
    ).length
    const inProgressCount = list.filter(
      t => t.status === TaskStatus.InProgress,
    ).length
    const waitingCount = list.filter(t => t.status === TaskStatus.Pending).length
    const inProgress = inProgressCount + waitingCount

    const pieData = [
      { status: TaskStatus.InProgress, value: inProgressCount },
      { status: TaskStatus.Completed, value: completed },
      { status: TaskStatus.Pending, value: waitingCount },
    ].filter(x => x.value > 0)

    const end = filters.to ? new Date(filters.to) : new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    if (filters.from) {
      const f = new Date(filters.from)
      if (f > start) start.setTime(f.getTime())
    }
    const days: string[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0])
    }
    const openedMap = new Map<string, number>()
    const closedMap = new Map<string, number>()
    list.forEach(t => {
      const created = t.createdAt?.split('T')[0]
      const updated = t.updatedAt?.split('T')[0]
      if (days.includes(created)) {
        openedMap.set(created, (openedMap.get(created) || 0) + 1)
      }
      if (t.status === TaskStatus.Completed && days.includes(updated)) {
        closedMap.set(updated, (closedMap.get(updated) || 0) + 1)
      }
    })
    const lineData = days.map(d => ({
      date: d.split('-').reverse().join('.'),
      opened: openedMap.get(d) || 0,
      closed: closedMap.get(d) || 0,
    }))
    const allZero = lineData.every(l => l.opened === 0 && l.closed === 0)

    return {
      total,
      completed,
      overdue,
      inProgress,
      pieData,
      lineData,
      allZero,
    }
  }, [tasks, filters])

  return (
    <div className='flex flex-col gap-6 md:gap-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-20 rounded-2xl bg-neutral-200 shadow-card animate-pulse'
            />
          ))
        ) : error ? (
          <div className='col-span-full text-error text-sm'>
            Ошибка загрузки{' '}
            <button className='underline' onClick={() => refetch()}>
              Повторить
            </button>
          </div>
        ) : (
          [
            {
              label: 'Всего задач',
              value: total,
              icon: '📋',
              circle: 'bg-info/10 text-info',
            },
            {
              label: 'Выполненные',
              value: completed,
              icon: '✅',
              circle: 'bg-success/10 text-success',
            },
            {
              label: 'Просроченные',
              value: overdue,
              icon: '⏰',
              circle: 'bg-error/10 text-error',
            },
            {
              label: 'В работе',
              value: inProgress,
              icon: '🔄',
              circle: 'bg-warning/10 text-warning',
            },
          ].map(k => (
            <div
              key={k.label}
              className='rounded-2xl shadow-card p-4 md:p-5 bg-neutral-200 flex items-center gap-3'
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${k.circle}`}
              >
                {k.icon}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm text-neutral-800 truncate'>{k.label}</div>
                <div
                  className='text-xl sm:text-2xl md:text-3xl font-semibold tabular-nums text-neutral-900 truncate'
                  title={numberFmt.format(k.value)}
                >
                  {numberFmt.format(k.value)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 mb-4'>
            <span>🗂</span>
            <span>Статусы задач</span>
          </h3>
          {isLoading ? (
            <div className='h-72 animate-pulse bg-neutral-300 rounded' />
          ) : error ? (
            <div className='text-sm text-error'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          ) : pieData.length > 0 ? (
            <div className='grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4'>
              <div className='h-72 w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey='value'
                      nameKey='status'
                      innerRadius='45%'
                      outerRadius='75%'
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={statusColors[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, _n, { payload }) => [
                        numberFmt.format(v as number),
                        `${payload.status} (${(payload.percent * 100).toFixed(1)}%)`,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <aside className='flex flex-col gap-2 justify-start overflow-auto max-h-72'>
                {pieData.map((item, i) => (
                  <div key={i} className='flex items-center gap-2 text-sm'>
                    <span
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: statusColors[item.status] }}
                    />
                    <span className='text-neutral-900'>{item.status}</span>
                    <span className='text-neutral-700'>{numberFmt.format(item.value)}</span>
                  </div>
                ))}
              </aside>
            </div>
          ) : (
            <div className='text-sm text-neutral-500'>Нет данных</div>
          )}
        </div>

        <div className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 mb-4'>
            <span>📈</span>
            <span>Динамика за неделю</span>
          </h3>
          {isLoading ? (
            <div className='h-64 animate-pulse bg-neutral-300 rounded' />
          ) : error ? (
            <div className='text-sm text-error'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          ) : (
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={lineData} margin={{ left: 40, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={v => numberFmt.format(v as number)} />
                  <Line type='monotone' dataKey='opened' name='Открыто' stroke='#3b82f6' strokeWidth={2} dot />
                  <Line type='monotone' dataKey='closed' name='Закрыто' stroke='#10b981' strokeWidth={2} dot />
                  {allZero && (
                    <ReferenceLine y={0} stroke='#ef4444' strokeWidth={1} />
                  )}
                </LineChart>
              </ResponsiveContainer>
              {allZero && (
                <div className='absolute inset-0 flex items-center justify-center text-neutral-500'>
                  Нет данных за выбранный период
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TasksTab

