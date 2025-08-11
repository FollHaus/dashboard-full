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
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<typeof periods[number]['key']>('day')

  useEffect(() => {
    AnalyticsService.getTurnover()
      .then(setTurnover)
      .catch(e => setError(e.message))
  }, [])

  const format = (val: number) => val.toLocaleString('ru-RU')
  const value = turnover ? turnover[period] : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <h3 className="text-lg font-semibold mb-2">Оборот</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`text-xs px-2 py-1 rounded ${
                period === p.key ? 'bg-primary-600 text-white' : 'bg-neutral-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {error && <p className="text-error text-sm mb-1">{error}</p>}
        <p className="text-2xl font-bold">{format(value)} ₽</p>
      </div>
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <h3 className="text-lg font-semibold mb-2">Заказы</h3>
        <p className="text-2xl font-bold">32 сегодня</p>
        <p className="text-sm text-neutral-700 mt-1">За неделю: 210</p>
      </div>
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <h3 className="text-lg font-semibold mb-2">Товары на складе</h3>
        <p className="text-2xl font-bold">1 200 шт.</p>
      </div>
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <h3 className="text-lg font-semibold mb-2">Открытые задачи</h3>
        <p className="text-2xl font-bold">8</p>
      </div>
    </div>
  )
}

export default Metrics

