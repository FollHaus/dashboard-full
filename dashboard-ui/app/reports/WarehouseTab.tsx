'use client'

import { FC, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  TooltipProps,
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

const pieColors = ['#c8b08d', '#9c9480', '#d4af37', '#cc7357', '#6b7d47']

const PieTooltip: FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const p = payload[0]
    return (
      <div className='bg-neutral-100 text-neutral-900 text-sm p-2 rounded shadow-card'>
        {`${p.name} / ${numberFmt.format(p.value as number)} / ${(p.percent * 100).toFixed(1)}%`}
      </div>
    )
  }
  return null
}

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
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='h-24 rounded-2xl bg-neutral-200 shadow-card animate-pulse'
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
            },
            {
              label: 'Мало на складе',
              value: lowCount,
            },
            {
              label: 'Неликвиды (%)',
              value: nonMovingPercent,
              percent: true,
            },
          ].map(k => (
            <div
              key={k.label}
              className='rounded-2xl bg-neutral-200 shadow-card p-4 flex flex-col items-center justify-center'
            >
              <div
                className='text-2xl md:text-3xl font-semibold tabular-nums text-neutral-900'
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
              <div className='text-sm text-neutral-800'>{k.label}</div>
            </div>
          ))
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='rounded-2xl bg-neutral-200 shadow-card p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start justify-start'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 col-span-full'>
            <span>🥧</span>
            <span>Остатки по категориям</span>
          </h3>
          {isLoading ? (
            <div className='h-80 w-full col-span-full animate-pulse bg-neutral-300 rounded' />
          ) : error ? (
            <div className='col-span-full text-sm text-error'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          ) : categoryData.length ? (
            <>
              <div className='h-80 w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart width='100%' height='100%'>
                    <Pie
                      data={categoryData}
                      dataKey='value'
                      nameKey='name'
                      outerRadius='70%'
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='max-h-80 overflow-auto flex flex-col gap-2'>
                {categoryData.map((c, i) => (
                  <div key={c.name} className='flex items-center gap-2 text-sm text-neutral-900'>
                    <span
                      className='w-3 h-3 rounded-full flex-shrink-0'
                      style={{ backgroundColor: pieColors[i % pieColors.length] }}
                    />
                    <span className='flex-1 truncate'>{c.name}</span>
                    <span className='tabular-nums'>
                      {numberFmt.format(c.value)} ({
                        totalRemains
                          ? ((c.value / totalRemains) * 100).toFixed(1)
                          : 0
                      }%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='col-span-full text-sm text-neutral-500'>Нет данных</div>
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

