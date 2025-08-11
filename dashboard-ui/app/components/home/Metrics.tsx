'use client'

import React, { useEffect, useState } from 'react'
import { AnalyticsService } from '@/services/analytics/analytics.service'
import { ITurnover } from '@/shared/interfaces/turnover.interface'

const periods = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'year', label: 'Год' },
  { key: 'allTime', label: 'Все время' },
] as const

const Metrics = () => {
  const [turnover, setTurnover] = useState<ITurnover | null>(null)
  const [turnoverError, setTurnoverError] = useState<string | null>(null)
  const [stock, setStock] = useState<number | null>(null)
  const [stockError, setStockError] = useState<string | null>(null)
  const [openTasks, setOpenTasks] = useState<number | null>(null)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [period, setPeriod] = useState<typeof periods[number]['key']>('day')

  useEffect(() => {
    AnalyticsService.getTurnover()
      .then(setTurnover)
      .catch(e => setTurnoverError(e.message))
    AnalyticsService.getProductRemains()
      .then(setStock)
      .catch(e => setStockError(e.message))
    AnalyticsService.getOpenTasks()
      .then(setOpenTasks)
      .catch(e => setTasksError(e.message))
  }, [])

  const format = (val: number) => val.toLocaleString('ru-RU')
  const value = turnover ? turnover[period] : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <h3 className="text-lg font-semibold mb-2">Оборот</h3>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as typeof periods[number]['key'])}
          className="mb-2 border border-neutral-300 rounded px-2 py-1 text-sm"
        >
          {periods.map(p => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
        {turnoverError && <p className="text-error text-sm mb-1">{turnoverError}</p>}
        <p className="text-2xl font-bold">{format(value)} ₽</p>
      </div>
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <h3 className="text-lg font-semibold mb-2">Товары на складе</h3>
        {stockError && <p className="text-error text-sm mb-1">{stockError}</p>}
        <p className="text-2xl font-bold">
          {stock !== null ? `${format(stock)} шт.` : '-'}
        </p>
      </div>
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <h3 className="text-lg font-semibold mb-2">Открытые задачи</h3>
        {tasksError && <p className="text-error text-sm mb-1">{tasksError}</p>}
        <p className="text-2xl font-bold">{openTasks !== null ? openTasks : '-'}</p>
      </div>
    </div>
  )
}

export default Metrics

