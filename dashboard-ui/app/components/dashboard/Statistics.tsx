'use client'

import React, { useState } from 'react'
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
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['overview-kpi', filter.period, startStr, endStr],
    queryFn: () => AnalyticsService.getKpis(startStr, endStr),
    keepPreviousData: true,
  })

  const revenue = data?.revenue ?? 0
  const cogs = data?.cogs ?? 0
  const profit = revenue - cogs
  const orders = data?.orders ?? 0

  return (
    <section className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 mb-6 md:mb-8 relative overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 overflow-visible">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <span>📋</span>Статистика
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:justify-end w-auto">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              data-active={filter.period === p}
              onClick={() => setFilter({ period: p, from: null, to: null })}
              className="h-9 px-3 rounded-full text-sm font-medium bg-neutral-100 hover:bg-neutral-300 text-neutral-900 data-[active=true]:bg-primary-500 data-[active=true]:text-neutral-50 whitespace-nowrap"
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
            data-active={filter.period === 'range'}
            onClick={() => setOpenRange(true)}
            className="h-9 px-3 rounded-full text-sm font-medium bg-neutral-100 hover:bg-neutral-300 text-neutral-900 data-[active=true]:bg-primary-500 data-[active=true]:text-neutral-50 whitespace-nowrap"
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
            title="Прибыль"
            icon="📈"
            value={currency.format(profit)}
            accent={profit > 0 ? 'success' : profit < 0 ? 'error' : 'neutral'}
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

