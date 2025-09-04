'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { safePct } from './utils'

interface Summary {
  completed: number
  inProgress: number
  pending: number
  overdue: number
}

const COLORS = {
  completed: '#10b981',
  inProgress: '#3b82f6',
  pending: '#9ca3af',
  overdue: '#ef4444',
} as const

export default function TaskStatusChart({ summary }: { summary: Summary }) {
  const completed = Math.max(0, summary.completed)
  const inProgress = Math.max(0, summary.inProgress)
  const pending = Math.max(0, summary.pending)
  const overdue = Math.max(0, summary.overdue)
  const total = completed + inProgress + pending + overdue

  if (total === 0) {
    return (
      <div className='h-[300px] flex items-center justify-center'>
        <div className='w-40 h-40 rounded-full bg-neutral-300 flex items-center justify-center text-sm text-neutral-600'>
          Нет данных за период
        </div>
      </div>
    )
  }

  const data = [
    {
      name: 'Готово',
      value: completed,
      pct: safePct(completed, total),
      color: COLORS.completed,
    },
    {
      name: 'Выполняется',
      value: inProgress,
      pct: safePct(inProgress, total),
      color: COLORS.inProgress,
    },
    {
      name: 'Ожидает',
      value: pending,
      pct: safePct(pending, total),
      color: COLORS.pending,
    },
    {
      name: 'Просрочено',
      value: overdue,
      pct: safePct(overdue, total),
      color: COLORS.overdue,
    },
  ]

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-4'>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie dataKey='value' data={data} innerRadius={70} outerRadius={110} paddingAngle={2}>
            {data.map(d => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any, _n: any, { payload }: any) =>
              `${payload.name}: ${v} задач (${payload.pct}%)`
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className='max-h-40 overflow-auto flex flex-col gap-2 text-sm'>
        {data.map(d => (
          <li key={d.name} className='flex items-center gap-2'>
            <span
              className='w-3 h-3 rounded-full flex-shrink-0'
              style={{ backgroundColor: d.color }}
            />
            <span>{d.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
