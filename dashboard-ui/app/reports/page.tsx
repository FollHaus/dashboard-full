'use client'

import { useEffect, useState, useRef, KeyboardEvent } from 'react'
import { CheckCircle2, RotateCcw, Download } from 'lucide-react'
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
import KpiCard from '@/components/ui/KpiCard'
import { IKpis } from '@/shared/interfaces/kpi.interface'

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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      applyFilters()
    }
    if (e.key === 'Escape') {
      resetFilters()
    }
  }

  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
    refetch: refetchKpis,
  } = useQuery<IKpis>({
    queryKey: ['reports', 'kpis', appliedFilters],
    queryFn: () =>
      AnalyticsService.getKpis(
        appliedFilters.from,
        appliedFilters.to,
        appliedFilters.categories,
      ),
    enabled: Boolean(appliedFilters.from && appliedFilters.to),
  })

  const gross = kpis ? kpis.revenue - kpis.cogs : 0
  const marginPct = kpis && kpis.revenue > 0 ? (gross / kpis.revenue) * 100 : 0
  const fmt = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  })

  const kpiCards = kpis
    ? [
        {
          title: 'Количество продаж',
          value: new Intl.NumberFormat('ru-RU', {
            notation: 'compact',
            compactDisplay: 'short',
          }).format(kpis.orders),
          icon: '📦',
          accent: 'info' as const,
        },
        {
          title: 'Средний чек',
          value: formatCurrency(kpis.avgCheck, { compact: true }),
          icon: '🛒',
          accent: 'warning' as const,
        },
        {
          title: 'Маржа',
          value: `${marginPct.toFixed(1)}%`,
          icon: '📊',
          accent: (marginPct > 0 ? 'success' : marginPct < 0 ? 'error' : 'neutral') as const,
        },
        {
          title: 'Выручка',
          value: fmt.format(kpis.revenue),
          icon: '💰',
          accentBg: 'bg-[#D1FAE5]',
          accentText: 'text-[#047857]',
        },
        {
          title: 'Прибыль',
          value: fmt.format(gross),
          icon: '📈',
          accentBg: 'bg-[#DBEAFE]',
          accentText: 'text-[#1D4ED8]',
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
      <div
        className='flex flex-wrap items-center gap-2 md:gap-3 px-2 md:px-0 mb-4'
        onKeyDown={handleKeyDown}
      >
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
          <div className='ml-auto flex items-center gap-2'>
            <button
              type='button'
              aria-label='Применить фильтры'
              title='Применить фильтры'
              className='h-10 w-10 flex items-center justify-center rounded-xl bg-primary-500 text-neutral-50 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={applyFilters}
              disabled={kpisLoading}
            >
              <CheckCircle2 className='w-5 h-5' />
            </button>
            <button
              type='button'
              aria-label='Сбросить фильтры'
              title='Сбросить фильтры'
              className='h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={resetFilters}
              disabled={kpisLoading}
            >
              <RotateCcw className='w-5 h-5' />
            </button>
            <button
              type='button'
              aria-label='Экспорт отчёта'
              title='Экспорт отчёта'
              className='h-10 w-10 flex items-center justify-center rounded-xl bg-info text-neutral-50 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-info disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleExport}
              disabled={exporting || kpisLoading}
            >
              <Download className='w-5 h-5' />
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
            {kpisLoading ? (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className='rounded-xl bg-neutral-100 shadow-card h-[92px] md:h-[100px] animate-pulse'
                    />
                  ))}
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className='rounded-xl bg-neutral-100 shadow-card h-[92px] md:h-[100px] animate-pulse'
                    />
                  ))}
                </div>
              </>
            ) : kpisError ? (
              <div className='text-error text-sm mb-3'>
                Ошибка загрузки{' '}
                <button className='underline' onClick={() => refetchKpis()}>
                  Повторить
                </button>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3'>
                  {kpiCards.slice(0, 3).map(k => (
                    <KpiCard
                      key={k.title}
                      title={k.title}
                      value={k.value}
                      icon={k.icon}
                      accent={k.accent}
                      accentBg={k.accentBg}
                      accentText={k.accentText}
                    />
                  ))}
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'>
                  {kpiCards.slice(3).map(k => (
                    <KpiCard
                      key={k.title}
                      title={k.title}
                      value={k.value}
                      icon={k.icon}
                      accent={k.accent}
                      accentBg={k.accentBg}
                      accentText={k.accentText}
                    />
                  ))}
                </div>
              </>
            )}
            <SalesTab filters={appliedFilters} />
          </>
        )}

        {active === 'warehouse' && <WarehouseTab filters={appliedFilters} />}

        {active === 'tasks' && <TasksTab filters={appliedFilters} />}
      </div>
    </Layout>
  )
}

