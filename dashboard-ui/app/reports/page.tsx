'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import Layout from '@/ui/Layout'
import Select from '@/ui/Select/Select'
import { CategoryService } from '@/services/category/category.service'
import { AnalyticsService } from '@/services/analytics/analytics.service'
import SalesTab from './SalesTab'
import WarehouseTab from './WarehouseTab'
import TasksTab from './TasksTab'
import { ICategory } from '@/shared/interfaces/category.interface'
import { formatCurrency } from '@/utils/formatCurrency'

const presets = [
  { label: 'Сегодня', value: 'today' },
  { label: '7 дней', value: '7d' },
  { label: '30 дней', value: '30d' },
  { label: 'Этот месяц', value: 'month' },
  { label: 'Произвольный', value: 'custom' },
] as const

type Preset = (typeof presets)[number]['value']

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function getRange(preset: Preset) {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)
  switch (preset) {
    case '7d':
      start.setDate(now.getDate() - 6)
      break
    case '30d':
      start.setDate(now.getDate() - 29)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    default:
      break
  }
  return { from: formatDate(start), to: formatDate(end) }
}

interface Filters {
  from: string
  to: string
  preset: Preset
  categories: number[]
}

export default function ReportsPage() {
  const router = useRouter()
  const STORAGE_KEY = 'reports.filters'

  const [preset, setPreset] = useState<Preset>('today')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [categories, setCategories] = useState<number[]>([])
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    from: '',
    to: '',
    preset: 'today',
    categories: [],
  })
  const [active, setActive] = useState<'sales' | 'warehouse' | 'tasks'>('sales')
  const [categoryOptions, setCategoryOptions] = useState<ICategory[]>([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    CategoryService.getAll().then(setCategoryOptions)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    const pr = (params.get('preset') as Preset) || parsed?.preset || 'today'
    const range = getRange(pr)
    const f = params.get('from') || parsed?.from || range.from
    const t = params.get('to') || parsed?.to || range.to
    const cats = params.getAll('categories[]').map(Number)
    const catArr = cats.length ? cats : parsed?.categories || []
    setPreset(pr)
    setFrom(f)
    setTo(t)
    setCategories(catArr)
    setAppliedFilters({ from: f, to: t, preset: pr, categories: catArr })
  }, [])

  useEffect(() => {
    if (preset !== 'custom') {
      const range = getRange(preset)
      setFrom(range.from)
      setTo(range.to)
    }
  }, [preset])

  const applyFilters = () => {
    const filters = { from, to, preset, categories }
    setAppliedFilters(filters)
    const params = new URLSearchParams()
    params.set('from', from)
    params.set('to', to)
    params.set('preset', preset)
    categories.forEach(c => params.append('categories[]', String(c)))
    router.replace(`?${params.toString()}`, { scroll: false })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  }

  const resetFilters = () => {
    const range = getRange('today')
    setPreset('today')
    setFrom(range.from)
    setTo(range.to)
    setCategories([])
    const filters = { from: range.from, to: range.to, preset: 'today', categories: [] }
    setAppliedFilters(filters)
    router.replace('', { scroll: false })
    localStorage.removeItem(STORAGE_KEY)
  }

  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
    refetch: refetchKpis,
  } = useQuery({
    queryKey: ['reports', 'kpis', appliedFilters],
    queryFn: () =>
      AnalyticsService.getKpis(
        appliedFilters.from,
        appliedFilters.to,
        appliedFilters.categories,
      ),
    enabled: Boolean(appliedFilters.from && appliedFilters.to),
  })

  const kpiCards = kpis
    ? [
        { label: 'Выручка', value: kpis.revenue, currency: true },
        { label: 'Количество заказов', value: kpis.orders },
        { label: 'Проданные единицы', value: kpis.unitsSold },
        { label: 'Средний чек', value: kpis.avgCheck, currency: true },
        { label: 'Маржа', value: kpis.margin, currency: true },
        { label: 'Выполненные задачи', value: kpis.completedTasks },
      ]
    : []

  const handleExport = async () => {
    if (!appliedFilters.from || !appliedFilters.to) return
    setExporting(true)
    try {
      const [sales, top] = await Promise.all([
        AnalyticsService.getDailyRevenue(
          appliedFilters.from,
          appliedFilters.to,
          appliedFilters.categories,
        ),
        AnalyticsService.getTopProducts(
          10,
          appliedFilters.from,
          appliedFilters.to,
          appliedFilters.categories,
        ),
      ])
      const rows: string[][] = []
      rows.push(['Период', `${appliedFilters.from} - ${appliedFilters.to}`])
      if (appliedFilters.categories.length) {
        const names = categoryOptions
          .filter(c => appliedFilters.categories.includes(c.id))
          .map(c => c.name)
          .join('; ')
        rows.push(['Категории', names])
      }
      rows.push([])
      rows.push(['Дата', 'Значение'])
      sales.forEach(s => rows.push([s.date, String(s.total)]))
      rows.push([])
      rows.push(['Товар', 'Выручка'])
      top.forEach(t => rows.push([t.productName, String(t.totalRevenue)]))
      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `report-${appliedFilters.from}-${appliedFilters.to}.csv`
      link.click()
    } finally {
      setExporting(false)
    }
  }

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
            <div className='md:col-span-6 flex flex-wrap gap-2'>
              {presets.map(p => (
                <button
                  key={p.value}
                  className={`px-3 py-1 text-sm rounded-full border cursor-pointer transition-colors ${
                    preset === p.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white border-neutral-300'
                  }`}
                  onClick={() => setPreset(p.value)}
                  aria-pressed={preset === p.value}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className='md:col-span-3 flex gap-2'>
              <input
                type='date'
                value={from}
                onChange={e => setFrom(e.target.value)}
                className='border border-neutral-300 rounded px-2 py-1 w-full'
              />
              <input
                type='date'
                value={to}
                onChange={e => setTo(e.target.value)}
                className='border border-neutral-300 rounded px-2 py-1 w-full'
              />
            </div>
            <div className='md:col-span-3'>
              <Select
                options={categoryOptions.map(c => ({ value: c.id, label: c.name }))}
                value={categories}
                onChange={setCategories}
                placeholder='Категории'
                dropdownClassName='max-h-40'
              />
            </div>
          </div>
          <div className='flex justify-end gap-2 mt-3'>
            <button
              onClick={applyFilters}
              className='px-4 py-2 bg-primary-500 text-white rounded disabled:opacity-50'
              disabled={kpisLoading}
            >
              Применить
            </button>
            <button
              onClick={resetFilters}
              className='px-4 py-2 border border-neutral-300 rounded'
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className='flex justify-end'>
          <button
            onClick={handleExport}
            className='px-4 py-2 bg-primary-500 text-white rounded disabled:opacity-50'
            disabled={exporting || kpisLoading}
          >
            Экспорт CSV
          </button>
        </div>

        <div className='flex gap-3 border-b border-neutral-300 mb-3'>
          {[
            { key: 'sales', label: 'Продажи' },
            { key: 'warehouse', label: 'Склад' },
            { key: 'tasks', label: 'Задачи' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key as any)}
              className={`px-3 py-2 rounded-t-lg text-sm font-medium cursor-pointer transition-colors ${
                active === t.key
                  ? 'bg-neutral-200 text-neutral-900 border border-neutral-300 border-b-transparent'
                  : 'text-neutral-800 hover:bg-neutral-100'
              }`}
              aria-current={active === t.key ? 'page' : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {active === 'sales' && (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6'>
              {kpisLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className='rounded-2xl bg-neutral-200 p-4 shadow-card animate-pulse h-20'
                  />
                ))
              ) : kpisError ? (
                <div className='col-span-full text-red-600 text-sm'>
                  Ошибка загрузки{' '}
                  <button className='underline' onClick={() => refetchKpis()}>
                    Повторить
                  </button>
                </div>
              ) : (
                kpiCards.map(k => (
                  <div key={k.label} className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
                    <div className='text-2xl font-semibold'>
                      {k.currency ? formatCurrency(k.value) : k.value}
                    </div>
                    <div className='text-sm'>{k.label}</div>
                  </div>
                ))
              )}
            </div>
            <SalesTab filters={appliedFilters} />
          </>
        )}

        {active === 'warehouse' && <WarehouseTab filters={appliedFilters} />}

        {active === 'tasks' && <TasksTab filters={appliedFilters} />}
      </div>
    </Layout>
  )
}

