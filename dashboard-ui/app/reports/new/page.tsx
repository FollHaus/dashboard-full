'use client'

import { useState } from 'react'

import Layout from '@/ui/Layout'

const periodPresets = [
  { label: 'Сегодня', value: 'today' },
  { label: '7 дней', value: '7d' },
  { label: '30 дней', value: '30d' },
  { label: 'Этот месяц', value: 'month' },
  { label: 'Произвольный диапазон', value: 'custom' },
]

const categories = ['Электроника', 'Одежда', 'Дом']

interface KPI {
  title: string
  value: number
  change: number
  currency?: boolean
}

export default function NewReportPage() {
  const [period, setPeriod] = useState('today')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const tabs = [
    { key: 'sales', label: 'Продажи' },
    { key: 'warehouse', label: 'Склад' },
    { key: 'tasks', label: 'Задачи' },
  ]
  const [activeTab, setActiveTab] = useState<'sales' | 'warehouse' | 'tasks'>('sales')
  const [selected, setSelected] = useState<string[]>([...categories])

  const kpis: KPI[] = [
    { title: 'Выручка', value: 150000, change: 5.2, currency: true },
    { title: 'Количество заказов', value: 320, change: -1.3 },
    { title: 'Проданные единицы', value: 845, change: 2.1 },
    { title: 'Средний чек', value: 4700, change: 0.4, currency: true },
    { title: 'Маржа', value: 23000, change: -0.8, currency: true },
    { title: 'Выполненные задачи', value: 42, change: 3.5 },
  ]

  const toggleCategory = (cat: string) => {
    setSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
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
        <div className="flex flex-wrap items-end justify-between gap-4">
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
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selected.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>
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
                {k.currency ? `${k.value.toLocaleString()} ₽` : k.value}
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
