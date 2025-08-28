'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CategoryService } from '@/services/category/category.service'
import { ICategory } from '@/shared/interfaces/category.interface'
import Layout from '@/ui/Layout'
import { formatCurrency } from '@/utils/formatCurrency'

const periodPresets = [
  { label: 'Сегодня', value: 'today' },
  { label: '7 дней', value: '7d' },
  { label: '30 дней', value: '30d' },
  { label: 'Этот месяц', value: 'month' },
  { label: 'Произвольный диапазон', value: 'custom' },
]

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function getRange(preset: string) {
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

interface KPI {
  title: string
  value: number
  change: number
  currency?: boolean
}

export default function NewReportPage() {
  const router = useRouter()
  const STORAGE_KEY = 'report.filters'

  const [period, setPeriod] = useState('today')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const tabs = [
    { key: 'sales', label: 'Продажи' },
    { key: 'warehouse', label: 'Склад' },
    { key: 'tasks', label: 'Задачи' },
  ]
  const [activeTab, setActiveTab] = useState<'sales' | 'warehouse' | 'tasks'>(
    'sales',
  )
  const [categories, setCategories] = useState<ICategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  const kpis: KPI[] = [
    { title: 'Выручка', value: 150000, change: 5.2, currency: true },
    { title: 'Количество заказов', value: 320, change: -1.3 },
    { title: 'Проданные единицы', value: 845, change: 2.1 },
    { title: 'Средний чек', value: 4700, change: 0.4, currency: true },
    { title: 'Маржа', value: 23000, change: -0.8, currency: true },
    { title: 'Выполненные задачи', value: 42, change: 3.5 },
  ]

  useEffect(() => {
    CategoryService.getAll().then(data => {
      setCategories(data)
      setSelectedCategories(data.map(c => c.id))
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    const preset = params.get('preset') || parsed?.preset
    const from = params.get('from') || parsed?.from
    const to = params.get('to') || parsed?.to
    if (preset) setPeriod(preset)
    if (from) setStart(from)
    if (to) setEnd(to)
  }, [])

  const periodInitialized = useRef(false)
  useEffect(() => {
    if (periodInitialized.current) {
      if (period !== 'custom') {
        const range = getRange(period)
        setStart(range.from)
        setEnd(range.to)
      }
    } else {
      periodInitialized.current = true
    }
  }, [period])

  useEffect(() => {
    if (!start || !end) return
    const params = new URLSearchParams(window.location.search)
    params.set('from', start)
    params.set('to', end)
    params.set('preset', period)
    router.replace(`?${params.toString()}`, { scroll: false })
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ from: start, to: end, preset: period }),
    )
  }, [start, end, period, router])

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const values = Array.from(
      e.target.selectedOptions,
      option => Number(option.value),
    )
    setSelectedCategories(values)
  }

  const exportCSV = () => {
    const rows = ['Показатель,Значение']
    kpis.forEach(k => rows.push(`${k.title},${k.value}`))
    const blob = new Blob([rows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${activeTab}-report.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-neutral-200 p-4 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Фильтры</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  /* период и даты уже синхронизируются через эффекты */
                }}
                className="px-3 py-1 bg-primary-500 text-white rounded"
              >
                Применить
              </button>
              <button
                onClick={() => {
                  const range = getRange('today')
                  setPeriod('today')
                  setStart(range.from)
                  setEnd(range.to)
                }}
                className="px-3 py-1 bg-white border rounded"
              >
                Сбросить
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {periodPresets.map(p => (
                <button
                  key={p.value}
                  className={`px-3 py-1 border rounded ${
                    period === p.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white'
                  }`}
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </button>
              ))}
              {period === 'custom' && (
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm">Категории</span>
              <select
                multiple
                value={selectedCategories.map(String)}
                onChange={handleCategoryChange}
                className="border rounded px-2 py-1 min-w-[200px] h-24"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-primary-500 text-white px-4 py-1 rounded"
            onClick={exportCSV}
          >
            Экспорт CSV
          </button>
        </div>

        <div className="flex gap-4 border-b">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`pb-2 ${
                activeTab === t.key
                  ? 'border-b-2 border-primary-500 font-semibold'
                  : 'text-neutral-500'
              }`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map(k => (
            <div
              key={k.title}
              className="rounded bg-white p-4 shadow sm:col-span-1"
            >
              <div className="text-sm text-neutral-500">{k.title}</div>
              <div className="text-xl font-semibold">
                {k.currency ? formatCurrency(k.value) : k.value}
              </div>
              <div
                className={k.change >= 0 ? 'text-green-600' : 'text-red-600'}
              >
                {k.change > 0 ? '+' : ''}
                {k.change}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
