'use client'

import { FC, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LabelList,
} from 'recharts'

import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'
import { ISale } from '@/shared/interfaces/sale.interface'

interface Filters {
  from: string
  to: string
  categories: number[]
  preset: string
}

interface Props {
  filters: Filters
}

interface ProductWithRelations extends IProduct {
  sales?: ISale[]
  category?: { id: number; name: string }
}

const numberFmt = new Intl.NumberFormat('ru-RU')
const compactFmt = new Intl.NumberFormat('ru-RU', {
  notation: 'compact',
  compactDisplay: 'short',
})

const WarehouseTab: FC<Props> = ({ filters }) => {
  const { data: products, isLoading, error, refetch } = useQuery<
    ProductWithRelations[],
    Error
  >({
    queryKey: ['reports', 'warehouse', 'products', filters],
    queryFn: () => ProductService.getAll(),
  })

  const {
    totalRemains,
    lowCount,
    nonMovingPercent,
    categoryData,
    topData,
    tableRows,
  } = useMemo(() => {
    const list: ProductWithRelations[] = (products ?? []).filter(p =>
      filters.categories.length
        ? filters.categories.includes(p.category?.id as number)
        : true,
    )

    const totalRemains = list.reduce((s, p) => s + (p.remains || 0), 0)
    const avgRemains = list.length ? totalRemains / list.length : 0
    const dynamicThreshold = avgRemains * 0.1

    let lowCount = 0
    let nonMovingCount = 0

    const tableRows = list
      .map(p => {
        const threshold = p.minStock ?? dynamicThreshold
        const periodSales = (p.sales ?? []).filter(s =>
          (!filters.from || s.saleDate >= filters.from) &&
          (!filters.to || s.saleDate <= filters.to),
        )
        const salesQty = periodSales.reduce((s, sale) => s + sale.quantitySold, 0)
        const lastSale = periodSales.sort((a, b) =>
          a.saleDate.localeCompare(b.saleDate),
        )
        const lastDate = lastSale.length
          ? lastSale[lastSale.length - 1].saleDate
          : null
        const isLow = (p.remains || 0) < threshold
        const isOut = (p.remains || 0) === 0
        if (isLow) lowCount++
        if (salesQty === 0) nonMovingCount++
        return {
          id: p.id,
          name: p.name,
          category: p.category?.name || '',
          remains: p.remains,
          threshold,
          lastSale: lastDate,
          isLow,
          isOut,
        }
      })
      .filter(r => r.isLow || r.isOut)

    const nonMovingPercent = list.length
      ? (nonMovingCount / list.length) * 100
      : 0

    const categoryMap = new Map<string, number>()
    list.forEach(p => {
      const cat = p.category?.name || 'Без категории'
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + (p.remains || 0))
    })
    const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    const topData = [...list]
      .sort((a, b) => (b.remains || 0) - (a.remains || 0))
      .slice(0, 5)
      .map(p => ({ name: p.name, value: p.remains || 0 }))

    return {
      totalRemains,
      lowCount,
      nonMovingPercent,
      categoryData,
      topData,
      tableRows,
    }
  }, [products, filters])

  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(tableRows.length / pageSize) || 1
  const rows = tableRows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className='flex flex-col gap-6 md:gap-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='h-20 rounded-2xl bg-neutral-200 shadow-card animate-pulse'
            />
          ))
        ) : error ? (
          <div className='col-span-full text-error text-sm'>
            Ошибка загрузки{' '}
            <button className='underline' onClick={() => refetch()}>
              Повторить
            </button>
          </div>
        ) : (
          [
            {
              label: 'Общий остаток',
              value: totalRemains,
              icon: '📦',
              circle: 'bg-primary-300 text-neutral-900',
            },
            {
              label: 'Мало на складе',
              value: lowCount,
              icon: '⚠️',
              circle: 'bg-warning/10 text-warning',
            },
            {
              label: 'Неликвиды (%)',
              value: nonMovingPercent,
              icon: '🚫',
              circle: 'bg-error/10 text-error',
              percent: true,
            },
          ].map(k => (
            <div
              key={k.label}
              className='rounded-2xl shadow-card p-4 md:p-5 bg-neutral-200 flex items-center gap-3'
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${k.circle}`}
              >
                {k.icon}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm text-neutral-800 truncate'>{k.label}</div>
                <div
                  className='text-xl sm:text-2xl md:text-3xl font-semibold tabular-nums text-neutral-900 truncate'
                  title={
                    k.percent
                      ? `${k.value.toFixed(1)}%`
                      : numberFmt.format(k.value)
                  }
                >
                  {k.percent
                    ? `${k.value.toFixed(1)}%`
                    : compactFmt.format(k.value)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 mb-4'>
            <span>🥧</span>
            <span>Остатки по категориям</span>
          </h3>
          {isLoading ? (
            <div className='h-64 animate-pulse bg-neutral-300 rounded' />
          ) : error ? (
            <div className='text-sm text-error'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          ) : categoryData.length ? (
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey='value'
                    nameKey='name'
                    outerRadius={80}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${(i * 67) % 360} 70% 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={v => numberFmt.format(v as number)}
                    labelFormatter={l => String(l)}
                  />
                  <Legend
                    content={({ payload }) => (
                      <div className='flex flex-col gap-1 overflow-y-auto max-h-52 ml-4'>
                        {payload?.map(p => (
                          <span key={p.value} className='text-sm'>
                            {p.value}
                          </span>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className='text-sm text-neutral-500'>Нет данных</div>
          )}
        </div>

        <div className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 mb-4'>
            <span>📊</span>
            <span>ТОП-5 товаров по остаткам</span>
          </h3>
          {isLoading ? (
            <div className='h-64 animate-pulse bg-neutral-300 rounded' />
          ) : error ? (
            <div className='text-sm text-error'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          ) : topData.length ? (
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  layout='vertical'
                  data={topData}
                  margin={{ left: 40, right: 16 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    type='number'
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey='name'
                    type='category'
                    width={150}
                    tick={{ fontSize: 12 }}
                    tickFormatter={v =>
                      String(v).length > 16
                        ? `${String(v).slice(0, 16)}…`
                        : String(v)
                    }
                  />
                  <Tooltip formatter={v => numberFmt.format(v as number)} />
                  <Bar dataKey='value' fill='#3b82f6'>
                    <LabelList
                      dataKey='value'
                      position='right'
                      formatter={v => numberFmt.format(v as number)}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className='text-sm text-neutral-500'>Нет данных</div>
          )}
        </div>
      </div>

      <div className='rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5'>
        <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 mb-4'>
          <span>📉</span>
          <span>Мало/нет</span>
        </h3>
        {isLoading ? (
          <div className='h-40 animate-pulse bg-neutral-300 rounded' />
        ) : error ? (
          <div className='text-sm text-error'>
            Ошибка{' '}
            <button className='underline' onClick={() => refetch()}>
              Повторить
            </button>
          </div>
        ) : rows.length ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left'>
                  <th className='py-1 pr-2'>Товар</th>
                  <th className='py-1 pr-2'>Категория</th>
                  <th className='py-1 pr-2 text-right'>Остаток</th>
                  <th className='py-1 pr-2 text-right'>Мин.остаток/Порог</th>
                  <th className='py-1 pr-2'>Последняя продажа</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr
                    key={r.id}
                    className={
                      r.isOut
                        ? 'bg-error/10 text-error'
                        : 'bg-warning/10'
                    }
                  >
                    <td className='py-1 pr-2'>{r.name}</td>
                    <td className='py-1 pr-2'>{r.category}</td>
                    <td className='py-1 pr-2 text-right'>{r.remains}</td>
                    <td className='py-1 pr-2 text-right'>
                      {Math.round(r.threshold)}
                    </td>
                    <td className='py-1 pr-2'>
                      {r.lastSale
                        ? r.lastSale.split('-').reverse().join('.')
                        : 'нет'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className='flex justify-end gap-2 mt-3'>
                <button
                  className='px-2 py-1 rounded bg-neutral-300 disabled:opacity-50'
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  aria-label='Предыдущая страница'
                >
                  «
                </button>
                <span className='px-2 py-1 text-sm'>
                  {page} / {totalPages}
                </span>
                <button
                  className='px-2 py-1 rounded bg-neutral-300 disabled:opacity-50'
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  aria-label='Следующая страница'
                >
                  »
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className='text-sm text-neutral-500'>Нет данных</div>
        )}
      </div>
    </div>
  )
}

export default WarehouseTab

