'use client'

import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts'

import { AnalyticsService } from '@/services/analytics/analytics.service'
import { formatCurrency } from '@/utils/formatCurrency'
import { ISalesStat } from '@/shared/interfaces/sales-stat.interface'
import { ITopProduct } from '@/shared/interfaces/top-product.interface'

interface Filters {
  from: string
  to: string
  categories: number[]
}

interface Props {
  filters: Filters
}

const SalesTab: FC<Props> = ({ filters }) => {
  const [metric, setMetric] = useState<'revenue' | 'count'>('revenue')

  const {
    data: sales,
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
  } = useQuery<ISalesStat[], Error>({
    queryKey: ['reports', 'sales-chart', metric, filters],
    queryFn: () =>
      metric === 'revenue'
        ? AnalyticsService.getDailyRevenue(
            filters.from,
            filters.to,
            filters.categories,
          )
        : AnalyticsService.getSales(
            filters.from,
            filters.to,
            filters.categories,
          ),
    enabled: Boolean(filters.from && filters.to),
  })

  const {
    data: topProducts,
    isLoading: topLoading,
    error: topError,
    refetch: refetchTop,
  } = useQuery<ITopProduct[], Error>({
    queryKey: ['reports', 'top-products', filters],
    queryFn: () =>
      AnalyticsService.getTopProducts(
        10,
        filters.from,
        filters.to,
        filters.categories,
      ),
    enabled: Boolean(filters.from && filters.to),
  })

  const chartData = (sales ?? []).map(s => ({ date: s.date, value: s.total }))
  const allZero = chartData.length === 0 || chartData.every(d => d.value === 0)

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-medium'>График продаж</h3>
          <div className='flex gap-2'>
            <button
              className={`px-2 py-1 text-sm rounded transition-colors cursor-pointer ${
                metric === 'revenue'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white'
              }`}
              onClick={() => setMetric('revenue')}
              aria-pressed={metric === 'revenue'}
            >
              Выручка
            </button>
            <button
              className={`px-2 py-1 text-sm rounded transition-colors cursor-pointer ${
                metric === 'count'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white'
              }`}
              onClick={() => setMetric('count')}
              aria-pressed={metric === 'count'}
            >
              Кол-во
            </button>
          </div>
        </div>
        <div className='h-64 relative'>
          {salesLoading ? (
            <div className='absolute inset-0 flex items-center justify-center text-sm text-neutral-500'>
              Загрузка...
            </div>
          ) : salesError ? (
            <div className='absolute inset-0 flex items-center justify-center text-sm text-red-600'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetchSales()}>
                Повторить
              </button>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='date' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={v =>
                    metric === 'revenue' ? formatCurrency(v as number) : String(v)
                  }
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={value =>
                    metric === 'revenue'
                      ? formatCurrency(value as number)
                      : (value as number).toLocaleString('ru-RU')
                  }
                  labelFormatter={label => label}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type='monotone'
                  dataKey='value'
                  stroke={metric === 'revenue' ? '#3B82F6' : '#10B981'}
                  strokeWidth={2}
                  dot={false}
                  name={metric === 'revenue' ? 'Выручка' : 'Количество'}
                />
                {allZero && <ReferenceLine y={0} stroke='#EF4444' strokeWidth={1} />}
              </LineChart>
            </ResponsiveContainer>
          )}
          {allZero && !salesLoading && !salesError && (
            <div className='absolute inset-0 flex items-center justify-center text-neutral-500'>
              Нет данных
            </div>
          )}
        </div>
      </div>

      <div className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
        <h3 className='font-medium mb-2'>Топ-10 товаров</h3>
        {topLoading ? (
          <div className='text-sm text-neutral-500'>Загрузка...</div>
        ) : topError ? (
          <div className='text-sm text-red-600'>
            Ошибка{' '}
            <button className='underline' onClick={() => refetchTop()}>
              Повторить
            </button>
          </div>
        ) : topProducts && topProducts.length > 0 ? (
          <ul className='space-y-1'>
            {topProducts.map(p => (
              <li key={p.productId} className='flex justify-between text-sm'>
                <span>{p.productName}</span>
                <span>{formatCurrency(p.totalRevenue)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-sm text-neutral-500'>Нет данных</div>
        )}
      </div>
    </div>
  )
}

export default SalesTab

