'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import Layout from '@/ui/Layout'
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
  { label: 'Год', value: 'year' },
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
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
      break
    default:
      break
  }
  return { from: formatDate(start), to: formatDate(end) }
}

function formatDisplayDate(date: string) {
  if (!date) return ''
  return date.split('-').reverse().join('.')
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
  const [rangeOpen, setRangeOpen] = useState(false)
  const rangeRef = useRef<HTMLDivElement>(null)
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    CategoryService.getAll().then(setCategoryOptions)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) {
        setRangeOpen(false)
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRangeOpen(false)
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
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
        {
          label: 'Количество продаж',
          value: kpis.orders,
          icon: '📦',
          iconClass: 'bg-primary-300 text-neutral-900',
          valueClass: 'text-neutral-900',
        },
        {
          label: 'Средний чек',
          value: kpis.avgCheck,
          currency: true,
          icon: '🛒',
          iconClass: 'bg-warning/10 text-warning',
          valueClass: 'text-warning',
        },
        {
          label: 'Маржа',
          value: kpis.margin,
          currency: true,
          icon: '📊',
          iconClass: 'bg-success/10 text-success',
          valueClass: kpis.margin >= 0 ? 'text-success' : 'text-error',
        },
        {
          label: 'Выполненные задачи',
          value: kpis.completedTasks,
          icon: '✅',
          iconClass: 'bg-info/10 text-info',
          valueClass: 'text-info',
        },
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
      <div className='flex flex-col gap-6 md:gap-8'>
        <div className='flex flex-wrap items-center gap-2 md:gap-3 px-2 md:px-0 mb-4'>
          <div className='flex items-center gap-1'>
            <span aria-hidden>🎯</span>
            {presets.map(p => (
              <button
                key={p.value}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  preset === p.value
                    ? 'bg-success/20 text-success'
                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-300'
                }`}
                onClick={() => setPreset(p.value)}
                aria-pressed={preset === p.value}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className='relative' ref={rangeRef}>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>📅</span>
            <input
              readOnly
              aria-label='Период'
              onClick={() => setRangeOpen(o => !o)}
              value={`${formatDisplayDate(from)} — ${formatDisplayDate(to)}`}
              className='h-10 pl-9 pr-3 rounded-xl border border-neutral-300 bg-neutral-100 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 cursor-pointer'
            />
            {rangeOpen && (
              <div className='absolute z-50 mt-1 bg-white border border-neutral-300 rounded-xl p-3 shadow-card flex gap-2'>
                <input
                  type='date'
                  value={from}
                  onChange={e => {
                    setFrom(e.target.value)
                    setPreset('custom')
                  }}
                  className='border border-neutral-300 rounded-lg px-2 py-1'
                />
                <span className='self-center'>—</span>
                <input
                  type='date'
                  value={to}
                  onChange={e => {
                    setTo(e.target.value)
                    setPreset('custom')
                  }}
                  className='border border-neutral-300 rounded-lg px-2 py-1'
                />
              </div>
            )}
          </div>
          <div className='relative' ref={catRef}>
            <button
              type='button'
              onClick={() => setCatOpen(o => !o)}
              aria-haspopup='listbox'
              className='h-10 px-3 rounded-xl border border-neutral-300 bg-neutral-100 inline-flex items-center gap-2 cursor-pointer'
            >
              <span aria-hidden>🗂</span>
              <span>Категории{categories.length ? ` (${categories.length})` : ''}</span>
            </button>
            {catOpen && (
              <div className='absolute z-50 mt-1 bg-white border border-neutral-300 rounded-xl shadow-card max-h-64 overflow-auto w-48 p-2 space-y-1'>
                {categoryOptions.map(c => (
                  <label
                    key={c.id}
                    className='flex items-center gap-2 cursor-pointer hover:bg-neutral-100 rounded px-2 py-1'
                  >
                    <input
                      type='checkbox'
                      checked={categories.includes(c.id)}
                      onChange={() => {
                        if (categories.includes(c.id)) {
                          setCategories(categories.filter(id => id !== c.id))
                        } else {
                          setCategories([...categories, c.id])
                        }
                      }}
                      className='cursor-pointer'
                    />
                    <span className='truncate'>{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className='flex gap-2 ml-auto'>
            <button
              type='button'
              onClick={handleExport}
              className='h-10 px-3 rounded-xl bg-info text-neutral-50 hover:brightness-95 focus:ring-2 focus:ring-info cursor-pointer disabled:opacity-50'
              disabled={exporting || kpisLoading}
            >
              Экспорт
            </button>
            <button
              onClick={applyFilters}
              className='h-10 px-3 rounded-xl bg-primary-500 text-neutral-50 hover:bg-primary-400 focus:ring-2 focus:ring-primary-300 cursor-pointer disabled:opacity-50'
              disabled={kpisLoading}
            >
              Применить
            </button>
            <button
              onClick={resetFilters}
              className='h-10 px-3 rounded-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-300 cursor-pointer'
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className='flex gap-3 border-b border-neutral-300 mb-3' role='tablist'>
          {[
            { key: 'sales', label: 'Продажи', icon: '📈' },
            { key: 'warehouse', label: 'Склад', icon: '📦' },
            { key: 'tasks', label: 'Задачи', icon: '✅' },
          ].map(t => (
            <button
              key={t.key}
              role='tab'
              onClick={() => setActive(t.key as any)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                active === t.key
                  ? 'bg-info text-neutral-50'
                  : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
              }`}
              aria-selected={active === t.key}
            >
              <span className='mr-1'>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {active === 'sales' && (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
              {kpisLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='rounded-2xl bg-neutral-200 p-4 shadow-card animate-pulse h-20'
                  />
                ))
              ) : kpisError ? (
                <div className='col-span-full text-error text-sm'>
                  Ошибка загрузки{' '}
                  <button className='underline' onClick={() => refetchKpis()}>
                    Повторить
                  </button>
                </div>
              ) : (
                kpiCards.map(k => (
                  <div
                    key={k.label}
                    className='rounded-2xl shadow-card p-4 md:p-5 bg-neutral-200 flex items-center gap-3'
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${k.iconClass}`}
                    >
                      {k.icon}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='text-sm text-neutral-800 truncate'>{k.label}</div>
                      <div
                        className={`max-w-full overflow-hidden text-ellipsis whitespace-nowrap tabular-nums font-semibold text-xl sm:text-2xl md:text-3xl ${k.valueClass}`}
                        title={
                          k.currency
                            ? formatCurrency(k.value)
                            : new Intl.NumberFormat('ru-RU').format(k.value)
                        }
                      >
                        {k.currency
                          ? formatCurrency(k.value, { compact: true })
                          : new Intl.NumberFormat('ru-RU', {
                              notation: 'compact',
                              compactDisplay: 'short',
                            }).format(k.value)}
                      </div>
                    </div>
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

