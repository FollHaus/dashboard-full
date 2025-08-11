'use client'

import { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import Layout from '@/ui/Layout'
import SalesTab from './SalesTab'
import WarehouseTab from './WarehouseTab'
import TasksTab from './TasksTab'

const tabs = [
  { key: 'sales', label: 'Sales' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'tasks', label: 'Tasks' },
] as const

type TabKey = (typeof tabs)[number]['key']

const categories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Clothing' },
  { id: 3, name: 'Home' },
]

interface SaleRecord {
  date: string
  categoryId: number
  orders: number
  units: number
  revenue: number
  cost: number
}

const salesRecords: SaleRecord[] = [
  { date: '2025-08-01', categoryId: 1, orders: 5, units: 7, revenue: 700, cost: 400 },
  { date: '2025-08-02', categoryId: 2, orders: 3, units: 4, revenue: 400, cost: 250 },
  { date: '2025-08-03', categoryId: 1, orders: 6, units: 9, revenue: 900, cost: 500 },
  { date: '2025-08-04', categoryId: 3, orders: 2, units: 3, revenue: 300, cost: 150 },
  { date: '2025-08-05', categoryId: 2, orders: 4, units: 5, revenue: 500, cost: 260 },
  { date: '2025-08-06', categoryId: 1, orders: 7, units: 10, revenue: 1000, cost: 600 },
  { date: '2025-08-07', categoryId: 3, orders: 3, units: 4, revenue: 350, cost: 180 },
  { date: '2025-08-08', categoryId: 1, orders: 5, units: 7, revenue: 750, cost: 420 },
  { date: '2025-08-09', categoryId: 2, orders: 6, units: 8, revenue: 800, cost: 450 },
  { date: '2025-08-10', categoryId: 3, orders: 4, units: 6, revenue: 600, cost: 300 },
  { date: '2025-08-11', categoryId: 1, orders: 8, units: 11, revenue: 1100, cost: 650 },
]

const salesRecordsPrev: SaleRecord[] = [
  { date: '2025-07-25', categoryId: 1, orders: 4, units: 6, revenue: 600, cost: 350 },
  { date: '2025-07-26', categoryId: 2, orders: 2, units: 3, revenue: 300, cost: 180 },
  { date: '2025-07-27', categoryId: 1, orders: 5, units: 8, revenue: 800, cost: 450 },
  { date: '2025-07-28', categoryId: 3, orders: 1, units: 2, revenue: 200, cost: 100 },
  { date: '2025-07-29', categoryId: 2, orders: 3, units: 4, revenue: 450, cost: 230 },
  { date: '2025-07-30', categoryId: 1, orders: 6, units: 9, revenue: 900, cost: 520 },
  { date: '2025-07-31', categoryId: 3, orders: 2, units: 3, revenue: 280, cost: 140 },
  { date: '2025-08-01', categoryId: 1, orders: 4, units: 6, revenue: 650, cost: 380 },
  { date: '2025-08-02', categoryId: 2, orders: 5, units: 7, revenue: 700, cost: 390 },
  { date: '2025-08-03', categoryId: 3, orders: 3, units: 4, revenue: 330, cost: 170 },
  { date: '2025-08-04', categoryId: 1, orders: 5, units: 7, revenue: 780, cost: 430 },
]

const productSales = [
  { name: 'Laptop', categoryId: 1, revenue: 3000 },
  { name: 'Phone', categoryId: 1, revenue: 2500 },
  { name: 'Jeans', categoryId: 2, revenue: 1800 },
  { name: 'Shirt', categoryId: 2, revenue: 1600 },
  { name: 'Sofa', categoryId: 3, revenue: 1400 },
  { name: 'Lamp', categoryId: 3, revenue: 1200 },
  { name: 'Headphones', categoryId: 1, revenue: 1100 },
  { name: 'Jacket', categoryId: 2, revenue: 1000 },
  { name: 'Table', categoryId: 3, revenue: 900 },
  { name: 'Watch', categoryId: 1, revenue: 800 },
]

const warehouseStats = { initial: 1200, arrival: 300, departure: 200, final: 1300 }
const warehouseMovement = [
  { date: '2025-08-05', arrival: 30, departure: 20 },
  { date: '2025-08-06', arrival: 50, departure: 40 },
  { date: '2025-08-07', arrival: 20, departure: 35 },
  { date: '2025-08-08', arrival: 40, departure: 30 },
  { date: '2025-08-09', arrival: 60, departure: 45 },
]

const tasksStats = { current: 42, previous: 35 }

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function shiftDate(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return formatDate(d)
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

export default function ReportsPage() {
  const [active, setActive] = useState<TabKey>('sales')
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'month' | 'custom'>('7d')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    categories.map(c => c.id)
  )

  useEffect(() => {
    const today = new Date()
    let s = ''
    let e = ''
    if (period === 'today') {
      s = e = formatDate(today)
    } else if (period === '7d') {
      e = formatDate(today)
      const sDate = new Date(today)
      sDate.setDate(sDate.getDate() - 6)
      s = formatDate(sDate)
    } else if (period === '30d') {
      e = formatDate(today)
      const sDate = new Date(today)
      sDate.setDate(sDate.getDate() - 29)
      s = formatDate(sDate)
    } else if (period === 'month') {
      const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      s = formatDate(startMonth)
      e = formatDate(endMonth)
    }
    if (period !== 'custom') {
      setStart(s)
      setEnd(e)
    }
  }, [period])

  const categoryIds = selectedCategories.length
    ? selectedCategories
    : categories.map(c => c.id)

  const filteredRecords = useMemo(
    () =>
      salesRecords.filter(
        r =>
          (!start || r.date >= start) &&
          (!end || r.date <= end) &&
          categoryIds.includes(r.categoryId)
      ),
    [start, end, categoryIds]
  )

  const filteredPrevRecords = useMemo(() => {
    if (!start || !end) return [] as SaleRecord[]
    const days =
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) / 86400000
      ) + 1
    const prevEnd = shiftDate(start, -1)
    const prevStart = shiftDate(prevEnd, -(days - 1))
    return salesRecordsPrev.filter(
      r =>
        r.date >= prevStart &&
        r.date <= prevEnd &&
        categoryIds.includes(r.categoryId)
    )
  }, [start, end, categoryIds])

  const metrics = useMemo(() => {
    const sum = (arr: SaleRecord[], key: 'revenue' | 'orders' | 'units' | 'cost') =>
      arr.reduce((s, r) => s + r[key], 0)

    const revenue = sum(filteredRecords, 'revenue')
    const prevRevenue = sum(filteredPrevRecords, 'revenue')
    const orders = sum(filteredRecords, 'orders')
    const prevOrders = sum(filteredPrevRecords, 'orders')
    const units = sum(filteredRecords, 'units')
    const prevUnits = sum(filteredPrevRecords, 'units')
    const margin = revenue - sum(filteredRecords, 'cost')
    const prevMargin = prevRevenue - sum(filteredPrevRecords, 'cost')
    const avgReceipt = orders ? revenue / orders : 0
    const prevAvgReceipt = prevOrders ? prevRevenue / prevOrders : 0

    return {
      revenue,
      revenueChange: prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
      orders,
      ordersChange: prevOrders ? ((orders - prevOrders) / prevOrders) * 100 : 0,
      units,
      unitsChange: prevUnits ? ((units - prevUnits) / prevUnits) * 100 : 0,
      avgReceipt,
      avgReceiptChange: prevAvgReceipt
        ? ((avgReceipt - prevAvgReceipt) / prevAvgReceipt) * 100
        : 0,
      marginValue: margin,
      marginPercent: revenue ? (margin / revenue) * 100 : 0,
      marginChange: prevMargin ? ((margin - prevMargin) / prevMargin) * 100 : 0,
    }
  }, [filteredRecords, filteredPrevRecords])

  const topProducts = useMemo(
    () =>
      productSales
        .filter(p => categoryIds.includes(p.categoryId))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
    [categoryIds]
  )

  const revenueData = useMemo(() => {
    const map: Record<string, number> = {}
    filteredRecords.forEach(r => {
      map[r.date] = (map[r.date] || 0) + r.revenue
    })
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }))
  }, [filteredRecords])

  const handleCategoryToggle = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleExport = () => {
    let data: any[] = []
    if (active === 'sales') data = revenueData
    else if (active === 'warehouse') data = warehouseMovement
    else if (active === 'tasks')
      data = [{ date: start, completed: tasksStats.current }]

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
    { label: 'Revenue (₽)', value: metrics.revenue, change: metrics.revenueChange },
    { label: 'Number of orders', value: metrics.orders, change: metrics.ordersChange },
    { label: 'Units sold', value: metrics.units, change: metrics.unitsChange },
    {
      label: 'Average receipt (₽)',
      value: metrics.avgReceipt,
      change: metrics.avgReceiptChange,
    },
    {
      label: 'Margin (₽)',
      value: metrics.marginValue,
      change: metrics.marginChange,
      extra: `${metrics.marginPercent.toFixed(1)}%`,
    },
    {
      label: 'Completed tasks (pcs.)',
      value: tasksStats.current,
      change: tasksStats.previous
        ? ((tasksStats.current - tasksStats.previous) / tasksStats.previous) * 100
        : 0,
    },
  ]

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='flex flex-col'>
            <span className='text-sm'>Period</span>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as any)}
              className='border border-neutral-300 rounded px-2 py-1'
            >
              <option value='today'>Today</option>
              <option value='7d'>7 days</option>
              <option value='30d'>30 days</option>
              <option value='month'>This month</option>
              <option value='custom'>Custom</option>
            </select>
          </div>
          {period === 'custom' && (
            <>
              <label className='flex flex-col'>
                <span className='text-sm'>Start date</span>
                <input
                  type='date'
                  value={start}
                  onChange={e => setStart(e.target.value)}
                  className='border border-neutral-300 rounded px-2 py-1'
                />
              </label>
              <label className='flex flex-col'>
                <span className='text-sm'>End date</span>
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
            <span className='text-sm'>Categories</span>
            <div className='flex flex-wrap gap-2'>
              {categories.map(c => (
                <label key={c.id} className='flex items-center space-x-1'>
                  <input
                    type='checkbox'
                    checked={categoryIds.includes(c.id)}
                    onChange={() => handleCategoryToggle(c.id)}
                  />
                  <span className='text-sm'>{c.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={handleExport}
            className='ml-auto px-4 py-2 bg-primary-500 text-white rounded'
          >
            Export CSV
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
          {kpis.map(k => (
            <div key={k.label} className='p-4 bg-white rounded shadow'>
              <div className='text-sm'>{k.label}</div>
              <div className='text-2xl font-semibold'>
                {k.value.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={`text-sm ${k.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {k.change >= 0 ? '+' : ''}{k.change.toFixed(1)}%
                {k.extra && <span className='text-neutral-500 ml-1'>{k.extra}</span>}
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
            totalRevenue={metrics.revenue}
          />
        )}
        {active === 'warehouse' && (
          <WarehouseTab stats={warehouseStats} movement={warehouseMovement} />
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

