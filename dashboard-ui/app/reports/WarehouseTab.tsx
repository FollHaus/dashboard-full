'use client'

import { FC, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts'

import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'
import { ISale } from '@/shared/interfaces/sale.interface'
import KpiCard from '@/components/ui/KpiCard'

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
    pieData,
    top5,
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
      const remains = Number(p.remains ?? 0)
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + remains)
    })

    const data = Array.from(categoryMap.entries()).map(([category, remains]) => ({
      category: String(category),
      remains: Number(remains) || 0,
    }))
    const total = data.reduce((s, x) => s + x.remains, 0)
    const pieData = data
      .map(d => ({
        category: d.category,
        remains: d.remains,
        percent: total > 0 ? d.remains / total : 0,
      }))
      .filter(d => d.remains > 0)

    const top5 = list
      .map(x => ({
        name: String(x.name ?? ''),
        remains: Number(x.remains ?? 0),
      }))
      .sort((a, b) => b.remains - a.remains)
      .slice(0, 5)

    return {
      totalRemains,
      lowCount,
      nonMovingPercent,
       pieData,
      top5,
      tableRows,
    }
  }, [products, filters])

  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(tableRows.length / pageSize) || 1
  const rows = tableRows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className='flex flex-col gap-6 md:gap-8'>
      <div className='kpi-wrap grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='rounded-xl bg-neutral-100 shadow-card h-[92px] md:h-[100px] animate-pulse'
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
              title: 'Общий остаток',
              value: compactFmt.format(totalRemains),
              icon: '📦',
              accent: 'info' as const,
            },
            {
              title: 'Мало на складе',
              value: compactFmt.format(lowCount),
              icon: '⚠️',
              accent: 'warning' as const,
            },
            {
              title: 'Неликвиды',
              value: `${nonMovingPercent.toFixed(1)}%`,
              icon: '🧊',
              accent: 'info' as const,
            },
          ].map(k => (
            <KpiCard
              key={k.title}
              title={k.title}
              value={k.value}
              icon={k.icon}
              accent={k.accent}
            />
          ))
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <section className='rounded-2xl bg-neutral-200 shadow-card p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 col-span-full'>
            <span>🥧</span>
            <span>Остатки по категориям</span>
          </h3>
          {isLoading ? (
            <div className='h-[300px] lg:h-[360px] w-full col-span-full animate-pulse bg-neutral-300 rounded' />
          ) : error ? (
            <div className='col-span-full text-sm text-error'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          ) : pieData.length ? (
            <>
              <div className='min-w-0'>
                <div className='h-[300px] lg:h-[360px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <Pie
                        data={pieData}
                        dataKey='remains'
                        nameKey='category'
                        innerRadius='45%'
                        outerRadius='78%'
                        paddingAngle={1.5}
                        label={false}
                        labelLine={false}
                        isAnimationActive={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, _n, { payload }) => [
                          numberFmt.format(v as number),
                          `${payload.category} (${((payload.percent ?? 0) * 100).toFixed(1)}%)`,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <aside className='lg:block'>
                <div className='max-h-[360px] overflow-auto pr-2 space-y-2'>
                  {pieData.map((c, i) => (
                    <div key={c.category} className='flex items-center gap-2 text-sm'>
                      <span
                        className='w-3 h-3 rounded-full shrink-0'
                        style={{ backgroundColor: pieColors[i % pieColors.length] }}
                      />
                      <span
                        className='truncate max-w-[180px] text-neutral-900'
                        title={c.category}
                      >
                        {c.category}
                      </span>
                      <span className='ml-auto text-neutral-700 whitespace-nowrap'>
                        {((c.percent * 100) || 0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </aside>
            </>
          ) : (
            <div className='col-span-full text-sm text-neutral-500'>Нет данных</div>
          )}
        </section>

        <section className='col-span-1 w-full min-w-0 rounded-2xl bg-neutral-200 shadow-card p-5'>
          <h3 className='flex items-center gap-2 text-base md:text-lg font-semibold text-neutral-900 mb-4'>
            <span>📊</span>
            <span>ТОП-5 товаров по остаткам</span>
          </h3>
          {isLoading ? (
            <div className='w-full h-[340px] animate-pulse bg-neutral-300 rounded' />
          ) : error ? (
            <div className='text-sm text-error'>
              Ошибка{' '}
              <button className='underline' onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          ) : top5.length ? (
            <div className='w-full min-w-0'>
              <div className='w-full h-[340px] overflow-visible'>
                <ResponsiveContainer width='100%' height={340}>
                  <BarChart
                    data={top5}
                    layout='vertical'
                    margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    barCategoryGap={12}
                  >
                    <CartesianGrid stroke='#e6e0d4' strokeDasharray='3 3' />
                    <XAxis
                      type='number'
                      allowDecimals={false}
                      stroke='#645c4d'
                      tick={{ fontSize: 12 }}
                      tickFormatter={v => numberFmt.format(v ?? 0)}
                    />
                    <YAxis
                      type='category'
                      dataKey='name'
                      width={160}
                      stroke='#645c4d'
                      tick={{ fontSize: 12 }}
                      tickFormatter={s =>
                        String(s).length > 18
                          ? `${String(s).slice(0, 18)}…`
                          : String(s)
                      }
                    />
                    <Tooltip
                      formatter={(v: any, _n: any, { payload }) => [
                        numberFmt.format(v as number),
                        payload.name,
                      ]}
                    />
                    <Bar
                      dataKey='remains'
                      name='Остаток'
                      fill='#3b82f6'
                      barSize={22}
                      radius={[4, 4, 4, 4]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className='text-sm text-neutral-500'>Нет данных</div>
          )}
        </section>
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

