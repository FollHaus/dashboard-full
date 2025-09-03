'use client'

import React, { useState } from 'react'
import cn from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import ru from 'date-fns/locale/ru'

import { AnalyticsService } from '@/services/analytics/analytics.service'
import KpiCard from '@/components/ui/KpiCard'
import { useDashboardFilter, DEFAULT_FILTER } from '@/store/dashboardFilter'
import { getPeriodRange } from '@/utils/buckets'
import DateRangePicker from '@/components/ui/DateRangePicker'

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
const intFmt = new Intl.NumberFormat('ru-RU')

const formatISO = (d: Date) => d.toISOString().slice(0, 10)

const Statistics: React.FC = () => {
  const { filter: ctxFilter, setFilter } = useDashboardFilter()
  const filter = ctxFilter ?? DEFAULT_FILTER
  const { start, end } = getPeriodRange(filter)
  const startStr = formatISO(start)
  const endStr = formatISO(end)
  const [openRange, setOpenRange] = useState(false)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['overview-kpi', filter.period, startStr, endStr],
    queryFn: () => AnalyticsService.getKpis(startStr, endStr),
    keepPreviousData: true,
  })

  const revenue = data?.revenue ?? 0
  const profit = data?.margin ?? 0
  const orders = data?.orders ?? 0

  return (
    <section className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 mb-6 md:mb-8 relative overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="flex items-center text-lg font-semibold text-neutral-900">
          <span className="mr-2">📋</span>
          Статистика
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilter({ period: p, from: null, to: null })}
              className={cn(
                'h-9 px-3 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300',
                filter.period === p
                  ? 'bg-primary-500 text-neutral-50'
                  : 'bg-neutral-100 hover:bg-neutral-300',
              )}
              aria-pressed={filter.period === p}
            >
              {p === 'day'
                ? 'Сегодня'
                : p === 'week'
                  ? 'Неделя'
                  : p === 'month'
                    ? 'Месяц'
                    : 'Год'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpenRange(true)}
            className={cn(
              'h-9 px-3 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300',
              filter.period === 'range'
                ? 'bg-primary-500 text-neutral-50'
                : 'bg-neutral-100 hover:bg-neutral-300',
            )}
            aria-pressed={filter.period === 'range'}
            title={
              filter.from && filter.to
                ? `${format(new Date(filter.from), 'd MMMM yyyy', { locale: ru })} — ${format(
                    new Date(filter.to),
                    'd MMMM yyyy',
                    { locale: ru },
                  )}`
                : 'Выбрать диапазон дат'
            }
          >
            Диапазон…
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-error flex items-center gap-2">
          Ошибка загрузки
          <button className="underline" onClick={() => refetch()}>
            Повторить
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <KpiCard
            title="Выручка"
            icon="💰"
            value={currency.format(revenue)}
            accent="info"
          />
          <KpiCard
            title="Финансовый итог"
            icon="📈"
            value={currency.format(profit)}
            accent="success"
          />
          <KpiCard
            title="Кол-во продаж"
            icon="🛒"
            value={intFmt.format(orders)}
            accent="warning"
          />
        </div>
      )}

      {isFetching && data && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {openRange && (
        <DateRangePicker
          initial={{
            from: filter.from ? new Date(filter.from) : undefined,
            to: filter.to ? new Date(filter.to) : undefined,
          }}
          onCancel={() => setOpenRange(false)}
          onConfirm={(r) => {
            setFilter({
              period: 'range',
              from: formatISO(r.from),
              to: formatISO(r.to),
            })
            setOpenRange(false)
          }}
        />
      )}
    </section>
  )
}

export default Statistics

