'use client'

import { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import Layout from '@/ui/Layout'
import SalesTab from './SalesTab'
import WarehouseTab from './WarehouseTab'
import TasksTab from './TasksTab'
import { formatCurrency } from '@/utils/formatCurrency'
import { CategoryService } from '@/services/category/category.service'
import { AnalyticsService } from '@/services/analytics/analytics.service'
import { ICategory } from '@/shared/interfaces/category.interface'
import Select from '@/ui/Select/Select'

const tabs = [
  { key: 'sales', label: 'Продажи' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'tasks', label: 'Задачи' },
] as const

type TabKey = (typeof tabs)[number]['key']

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function toCsv(rows: any[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const csv = [headers.join(',')]
  rows.forEach(r => {
    csv.push(headers.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))
  })
  return csv.join('\n')
}

const warehouseStats = { initial: 1200, arrival: 300, departure: 200, final: 1300 }
const warehouseMovement = [
  {
    date: '2025-08-05',
    direction: 'arrival' as const,
    product: 'Ноутбук',
    article: 'NB-01',
    quantity: 30,
    reason: 'Поставка',
  },
  {
    date: '2025-08-06',
    direction: 'departure' as const,
    product: 'Телефон',
    article: 'PH-02',
    quantity: 12,
    reason: 'Продажа',
  },
  {
    date: '2025-08-07',
    direction: 'arrival' as const,
    product: 'Стол',
    article: 'ST-01',
    quantity: 5,
    reason: 'Возврат',
  },
  {
    date: '2025-08-08',
    direction: 'departure' as const,
    product: 'Диван',
    article: 'DV-05',
    quantity: 2,
    reason: 'Списание',
  },
  {
    date: '2025-08-09',
    direction: 'arrival' as const,
    product: 'Куртка',
    article: 'KT-03',
    quantity: 20,
    reason: 'Поставка',
  },
]

const tasksStats = { current: 42, previous: 35 }

export default function ReportsPage() {
  const [active, setActive] = useState<TabKey>('sales')
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'custom'>('week')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [categories, setCategories] = useState<ICategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [catLoading, setCatLoading] = useState(false)
  const [catError, setCatError] = useState(false)
  const [revenueData, setRevenueData] = useState<{ date: string; value: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: number }[]>([])

  const loadCategories = () => {
    setCatLoading(true)
    setCatError(false)
    CategoryService.getAll()
      .then(data => {
        setCategories(data)
      })
      .catch(() => setCatError(true))
      .finally(() => setCatLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const today = new Date()
    let s = formatDate(today)
    let e = formatDate(today)
    if (period === 'week') {
      const sDate = new Date(today)
      sDate.setDate(sDate.getDate() - 6)
      s = formatDate(sDate)
    } else if (period === 'month') {
      const sDate = new Date(today)
      sDate.setDate(sDate.getDate() - 29)
      s = formatDate(sDate)
    }
    if (period !== 'custom') {
      setStart(s)
      setEnd(e)
    }
  }, [period])

  useEffect(() => {
    if (!start || !end) return
    AnalyticsService.getDailyRevenue(start, end, selectedCategories).then(data => {
      setRevenueData(data.map(r => ({ date: r.date, value: r.total })))
    })
    AnalyticsService.getTopProducts(10, start, end, selectedCategories).then(data => {
      setTopProducts(data.map(p => ({ name: p.productName, revenue: p.totalRevenue })))
    })
  }, [start, end, selectedCategories])

  const totalRevenue = useMemo(
    () => revenueData.reduce((s, r) => s + r.value, 0),
    [revenueData]
  )

  const handleExport = () => {
    let data: any[] = []
    if (active === 'sales') data = revenueData
    else if (active === 'warehouse') data = warehouseMovement
    else if (active === 'tasks') data = [{ date: start, completed: tasksStats.current }]

    const csv = toCsv(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${active}-${start}-${end}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const kpis = [
    { label: 'Выручка', value: totalRevenue, change: 0, currency: true },
  ]

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='flex flex-col'>
            <span className='text-sm'>Период</span>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as any)}
              className='border border-neutral-300 rounded px-2 py-1'
            >
              <option value='day'>День</option>
              <option value='week'>Неделя</option>
              <option value='month'>Месяц</option>
              <option value='custom'>Произвольный</option>
            </select>
          </div>
          {period === 'custom' && (
            <>
              <label className='flex flex-col'>
                <span className='text-sm'>Дата начала</span>
                <input
                  type='date'
                  value={start}
                  onChange={e => setStart(e.target.value)}
                  className='border border-neutral-300 rounded px-2 py-1'
                />
              </label>
              <label className='flex flex-col'>
                <span className='text-sm'>Дата окончания</span>
                <input
                  type='date'
                  value={end}
                  onChange={e => setEnd(e.target.value)}
                  className='border border-neutral-300 rounded px-2 py-1'
                />
              </label>
            </>
          )}
          <div className='flex flex-col'>
            <span className='text-sm'>Категории</span>
            <Select
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={selectedCategories}
              onChange={setSelectedCategories}
              placeholder='Select a category'
              loading={catLoading}
              error={catError ? 'Failed to load categories' : undefined}
              onRetry={loadCategories}
            />
          </div>
          <button
            onClick={handleExport}
            className='ml-auto px-4 py-2 bg-primary-500 text-white rounded'
          >
            Экспорт CSV
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
          {kpis.map(k => (
            <div key={k.label} className='p-4 bg-white rounded shadow'>
              <div className='text-sm'>{k.label}</div>
              <div className='text-2xl font-semibold'>
                {k.currency
                  ? formatCurrency(k.value)
                  : k.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div
                className={`text-sm ${k.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {k.change >= 0 ? '+' : ''}{k.change.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <div className='flex space-x-4 border-b'>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={classNames('py-2 px-4 -mb-px', {
                'border-b-2 border-primary-500 font-medium': active === t.key,
              })}
            >
              {t.label}
            </button>
          ))}
        </div>

        {active === 'sales' && (
          <SalesTab
            revenueData={revenueData}
            topProducts={topProducts}
            totalRevenue={totalRevenue}
          />
        )}
        {active === 'warehouse' && (
          <WarehouseTab stats={warehouseStats} movements={warehouseMovement} />
        )}
        {active === 'tasks' && (
          <TasksTab
            completed={tasksStats.current}
            prevCompleted={tasksStats.previous}
          />
        )}
      </div>
    </Layout>
  )
}

