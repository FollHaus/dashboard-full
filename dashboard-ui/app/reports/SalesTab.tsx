'use client'

import { FC, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  LabelList,
} from 'recharts'

import { AnalyticsService } from '@/services/analytics/analytics.service'
import { formatCurrency } from '@/utils/formatCurrency'
import { ISalesStat } from '@/shared/interfaces/sales-stat.interface'
import { ITopProduct } from '@/shared/interfaces/top-product.interface'

interface Filters {
  from: string
  to: string
  preset: string
  categories: number[]
}

interface Props {
  filters: Filters
}

const intervals = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: 'Год', value: 'year' },
] as const

type Interval = (typeof intervals)[number]['value']

const SalesTab: FC<Props> = ({ filters }) => {
  const [interval, setInterval] = useState<Interval>('day')

  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
  } = useQuery<{ revenue: ISalesStat[]; count: ISalesStat[] }, Error>({
    queryKey: ['reports', 'sales-chart', filters],
    queryFn: async () => {
      const [revenue, count] = await Promise.all([
        AnalyticsService.getDailyRevenue(
          filters.from,
          filters.to,
          filters.categories,
        ),
        AnalyticsService.getSales(
          filters.from,
          filters.to,
          filters.categories,
        ),
      ])
      return { revenue, count }
    },
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

  const chartData = useMemo(() => {
    if (!salesData) return []
    const map = new Map<string, { revenue: number; count: number }>()
    const add = (dateStr: string, field: 'revenue' | 'count', value: number) => {
      const date = new Date(dateStr)
      let key = dateStr
      switch (interval) {
        case 'week': {
          const d = new Date(date)
          const day = (d.getDay() + 6) % 7
          d.setDate(d.getDate() - day)
          key = d.toISOString().split('T')[0]
          break
        }
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth()}`
          break
        case 'year':
          key = `${date.getFullYear()}`
          break
        default:
          key = date.toISOString().split('T')[0]
      }
      const item = map.get(key) || { revenue: 0, count: 0 }
      item[field] += value
      map.set(key, item)
    }
    salesData.revenue.forEach(r => add(r.date, 'revenue', r.total))
    salesData.count.forEach(c => add(c.date, 'count', c.total))
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => ({
        label:
          interval === 'month'
            ? new Intl.DateTimeFormat('ru-RU', {
                month: 'short',
                year: 'numeric',
              }).format(new Date(`${key}-01`))
            : interval === 'year'
            ? key
            : new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
              }).format(new Date(key)),
        revenue: val.revenue,
        count: val.count,
      }))
  }, [salesData, interval])

  const allZero =
    chartData.length === 0 ||
    chartData.every(d => d.revenue === 0 && d.count === 0)

  const topChartData = useMemo(() => {
    const items = topProducts ?? []

    const toNum = (v: unknown) => {
      const n =
        typeof v === 'string'
          ? Number(v.replace(/\s|₽|,/g, ''))
          : Number(v)
      return Number.isFinite(n) ? n : 0
    }

    const total = items.reduce((s, x) => s + toNum(x.totalRevenue), 0)

    return items
      .map(x => {
        const rev = toNum(x.totalRevenue)
        return {
          name: String(x.productName ?? ''),
          revenue: rev,
          share: total > 0 ? rev / total : 0,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [
    topProducts,
    filters.preset,
    filters.from,
    filters.to,
    filters.categories,
  ])

  const truncate = (s: string) => (s.length > 16 ? `${s.slice(0, 16)}…` : s)

  return (
    <div className='flex flex-col gap-6 md:gap-8'>
      <div className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 overflow-visible'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900'>
            <span>📈</span>
            <span>График продаж</span>
          </h3>
          <div className='flex gap-2'>
            {intervals.map(i => (
              <button
                key={i.value}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer ${
                  interval === i.value
                    ? 'bg-primary-500 text-neutral-50'
                    : 'bg-neutral-200 text-neutral-900'
                }`}
                onClick={() => setInterval(i.value)}
                aria-pressed={interval === i.value}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>
        <div className='h-64 relative overflow-visible'>
          {salesLoading ? (
            <div className='absolute inset-0 flex items-center justify-center text-sm text-neutral-500 pointer-events-none'>
              Загрузка...
            </div>
          ) : salesError ? (
            <div className='absolute inset-0 flex items-center justify-center text-sm text-error pointer-events-none'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetchSales()}>
                Повторить
              </button>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart
                data={chartData}
                margin={{ left: 72, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='label' tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId='left'
                  width={80}
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  stroke='#645c4d'
                  tickFormatter={v =>
                    new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      maximumFractionDigits: 0,
                    }).format((v as number) ?? 0)
                  }
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  tick={{ fontSize: 12 }}
                  tickFormatter={v =>
                    new Intl.NumberFormat('ru-RU').format(v as number)
                  }
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'Выручка, ₽'
                      ? formatCurrency(value as number)
                      : new Intl.NumberFormat('ru-RU').format(value as number)
                  }
                  labelFormatter={label => label}
                />
                <Bar yAxisId='left' dataKey='revenue' name='Выручка, ₽' fill='#10b981' />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='count'
                  name='Количество, шт'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  dot
                />
                {allZero && (
                  <ReferenceLine
                    y={0}
                    yAxisId='left'
                    stroke='#ef4444'
                    strokeWidth={1}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
          {allZero && !salesLoading && !salesError && (
            <div className='absolute inset-0 flex items-center justify-center text-neutral-500 pointer-events-none'>
              Нет данных за выбранный период
            </div>
          )}
        </div>
      </div>

      <div className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5'>
        <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 mb-4'>
          <span>🏆</span>
          <span>Топ-10 товаров</span>
        </h3>
        {topLoading ? (
          <div className='text-sm text-neutral-500'>Загрузка...</div>
        ) : topError ? (
          <div className='text-sm text-error'>
            Ошибка{' '}
            <button className='underline' onClick={() => refetchTop()}>
              Повторить
            </button>
          </div>
        ) : topChartData.length > 0 ? (
          <div className='h-96'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart layout='vertical' data={topChartData} margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  type='number'
                  tick={{ fontSize: 12 }}
                  tickFormatter={v => formatCurrency(v as number)}
                />
                <YAxis
                  dataKey='name'
                  type='category'
                  width={150}
                  tick={{ fontSize: 12 }}
                  tickFormatter={v => truncate(v as string)}
                />
                <Tooltip
                  formatter={(val, _name, { payload }) => [
                    new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      maximumFractionDigits: 0,
                    }).format(val as number),
                    `Выручка (${(payload.share * 100).toFixed(1)}%)`,
                  ]}
                  labelFormatter={label => label as string}
                />
                <Bar dataKey='revenue' fill='#10b981'>
                  <LabelList
                    dataKey='revenue'
                    position='right'
                    content={({ x, y, width, value, index }) => {
                      const share = topChartData[index].share
                      return (
                        <text
                          x={(x as number) + (width as number) + 4}
                          y={(y as number) + 10}
                          fill='#5a564c'
                          fontSize={12}
                        >
                          {`${(share * 100).toFixed(1)}% • ${new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            maximumFractionDigits: 0,
                          }).format(value as number)}`}
                        </text>
                      )
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='text-sm text-neutral-500'>Нет данных</div>
        )}
      </div>
    </div>
  )
}

export default SalesTab

