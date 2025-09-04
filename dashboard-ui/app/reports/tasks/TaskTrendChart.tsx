'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { Period } from '@/store/period'
import { formatTick } from './utils'

export interface TrendPoint {
  date: string
  opened: number
  closed: number
  overdue: number
}

export default function TaskTrendChart({
  data,
  period,
}: {
  data: TrendPoint[]
  period: Period
}) {
  const allZero = data.length === 0 || data.every(d => !d.opened && !d.closed && !d.overdue)
  return (
    <div className='relative h-[320px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 36, left: 56 }}>
          <CartesianGrid strokeOpacity={0.3} />
          <XAxis dataKey='date' tickFormatter={v => formatTick(v as string, period)} />
          <YAxis allowDecimals={false} />
          <Tooltip
            labelFormatter={v => formatTick(v as string, period)}
            formatter={(v: any, n: any) => [v, n === 'opened' ? 'Открыто' : n === 'closed' ? 'Закрыто' : 'Просрочено']}
          />
          <Bar dataKey='opened' name='Открыто' fill='#3b82f6' />
          <Line dataKey='closed' name='Закрыто' stroke='#10b981' strokeWidth={2} dot />
          <Line dataKey='overdue' name='Просрочено' stroke='#ef4444' strokeWidth={1} dot={false} />
          {allZero && <ReferenceLine y={0} stroke='#000' />}
        </ComposedChart>
      </ResponsiveContainer>
      {allZero && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none text-sm text-neutral-600'>
          Нет данных за период
        </div>
      )}
    </div>
  )
}
