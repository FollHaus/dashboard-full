"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AnalyticsService } from "@/services/analytics/analytics.service"
import { getPeriodRange } from "@/utils/buckets"
import { usePeriod } from "@/store/period"

const metricOptions = [
  { value: "revenue", label: "Выручка" },
  { value: "quantity", label: "Количество" },
] as const

const limitOptions = [5, 10, 15] as const

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#84CC16",
  "#D946EF",
  "#0EA5E9",
  "#F43F5E",
  "#22C55E",
  "#A855F7",
]

const rubFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
})
const intFormatter = new Intl.NumberFormat("ru-RU")
const formatRub = (v: number) => rubFormatter.format(v)
const formatInt = (v: number) => intFormatter.format(v)
const round2 = (v: number) => Math.round(v * 100) / 100

const formatDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)

const TopProducts: React.FC = () => {
  const router = useRouter()
  const { period } = usePeriod()
  const [metric, setMetric] = useState<(typeof metricOptions)[number]["value"]>(
    "revenue",
  )
  const [limit, setLimit] = useState<(typeof limitOptions)[number]>(5)
  const { start, end } = getPeriodRange(period)
  const s = formatDate(start)
  const e = formatDate(end)

  const {
    data: products,
    isLoading: prodLoading,
    isFetching: prodFetching,
    error: prodError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["top-products", period, s, e, metric, limit],
    queryFn: () => AnalyticsService.getTopProducts(15, s, e),
    keepPreviousData: true,
    placeholderData: (prev) => prev,
  })

  const {
    data: categories,
    isLoading: catLoading,
    isFetching: catFetching,
    error: catError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["category-sales", period, s, e, metric, limit],
    queryFn: () => AnalyticsService.getCategorySales(s, e),
    keepPreviousData: true,
    placeholderData: (prev) => prev,
  })

  const productsAgg = useMemo(() => {
    const map = new Map<number, { name: string; qty: number; rev: number }>()
    for (const row of products ?? []) {
      const productId = Number((row as any).productId)
      if (!productId) continue
      const productName = String((row as any).productName ?? "")
      const qty =
        Number(
          (row as any).quantity_sold ??
            (row as any).unitsSold ??
            (row as any).totalUnits ??
            0,
        ) || 0
      const rawRev =
        Number(
          (row as any).revenue ??
            (row as any).total_price ??
            (row as any).totalRevenue ??
            0,
        ) || 0
      const rev =
        ("revenue" in (row as any) || "total_price" in (row as any))
          ? rawRev / 100
          : rawRev
      const curr = map.get(productId) ?? { name: productName, qty: 0, rev: 0 }
      curr.name = productName || curr.name
      curr.qty += qty
      curr.rev += rev
      map.set(productId, curr)
    }
    return Array.from(map.entries()).map(([productId, v]) => ({
      productId,
      productName: v.name,
      totalUnits: Math.round(Number(v.qty) || 0),
      totalRevenue: round2(Number(v.rev) || 0),
    }))
  }, [products])

  const categoriesAgg = useMemo(() => {
    const map = new Map<number, { name: string; qty: number; rev: number }>()
    for (const row of categories ?? []) {
      const categoryId = Number((row as any).categoryId)
      if (!categoryId) continue
      const categoryName = String((row as any).categoryName ?? "")
      const qty =
        Number(
          (row as any).quantity_sold ??
            (row as any).unitsSold ??
            (row as any).totalUnits ??
            0,
        ) || 0
      const rawRev =
        Number(
          (row as any).revenue ??
            (row as any).total_price ??
            (row as any).totalRevenue ??
            0,
        ) || 0
      const rev =
        ("revenue" in (row as any) || "total_price" in (row as any))
          ? rawRev / 100
          : rawRev
      const curr = map.get(categoryId) ?? { name: categoryName, qty: 0, rev: 0 }
      curr.name = categoryName || curr.name
      curr.qty += qty
      curr.rev += rev
      map.set(categoryId, curr)
    }
    return Array.from(map.entries()).map(([categoryId, v]) => ({
      categoryId,
      categoryName: v.name,
      totalUnits: Math.round(Number(v.qty) || 0),
      totalRevenue: round2(Number(v.rev) || 0),
    }))
  }, [categories])

  const topProductData = useMemo(() => {
    const items = [...productsAgg]
    items.sort((a, b) =>
      metric === "revenue"
        ? b.totalRevenue - a.totalRevenue
        : b.totalUnits - a.totalUnits,
    )
    return items.slice(0, limit).map((p) => {
      const value =
        metric === "revenue"
          ? Number(p.totalRevenue) || 0
          : Number(p.totalUnits) || 0
      return {
        name: p.productName,
        value,
        productId: p.productId,
        productName: p.productName,
      }
    })
  }, [productsAgg, metric, limit])

  const pieData = useMemo(() => {
    const items = [...categoriesAgg]
    items.sort((a, b) =>
      metric === "revenue"
        ? b.totalRevenue - a.totalRevenue
        : b.totalUnits - a.totalUnits,
    )
    const top = items.slice(0, limit)
    const rest = items.slice(limit)
    if (rest.length) {
      const restValue = rest.reduce(
        (sum, c) =>
          sum + (metric === "revenue" ? c.totalRevenue : c.totalUnits),
        0,
      )
      if (restValue > 0) {
        top.push({
          categoryId: 0,
          categoryName: "Прочее",
          totalUnits:
            metric === "quantity" ? Math.round(restValue) : 0,
          totalRevenue:
            metric === "revenue" ? round2(restValue) : 0,
        })
      }
    }
    const data = top
      .map((c) => {
        const value =
          metric === "revenue"
            ? Number(c.totalRevenue) || 0
            : Number(c.totalUnits) || 0
        if (!isFinite(value)) return null
        return { name: c.categoryName, value, categoryId: c.categoryId }
      })
      .filter(Boolean) as {
      name: string
      value: number
      categoryId: number
    }[]

    const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0)
    return data.map((d) => ({ ...d, __total: total })) as {
      name: string
      value: number
      categoryId: number
      __total: number
    }[]
  }, [categoriesAgg, metric, limit])

  const formatValue = metric === "revenue" ? formatRub : formatInt
  const total = pieData.length ? Number(pieData[0].__total) : 0

  const productTotalQty = useMemo(
    () => productsAgg.reduce((s, p) => s + (Number(p.totalUnits) || 0), 0),
    [productsAgg],
  )
  const productTotalRev = useMemo(
    () => productsAgg.reduce((s, p) => s + (Number(p.totalRevenue) || 0), 0),
    [productsAgg],
  )
  const categoryTotalQty = useMemo(
    () => categoriesAgg.reduce((s, c) => s + (Number(c.totalUnits) || 0), 0),
    [categoriesAgg],
  )
  const categoryTotalRev = useMemo(
    () => categoriesAgg.reduce((s, c) => s + (Number(c.totalRevenue) || 0), 0),
    [categoriesAgg],
  )

  useEffect(() => {
    const round = metric === "revenue" ? round2 : Math.round
    const totalAll = round(
      metric === "revenue" ? categoryTotalRev : categoryTotalQty,
    )
    const totalTopPlusOther = round(total)
    console.debug({ metric, totalAll, totalTopPlusOther, equal: totalAll === totalTopPlusOther })
    const prodTotal = round(
      metric === "revenue" ? productTotalRev : productTotalQty,
    )
    const catTotal = round(
      metric === "revenue" ? categoryTotalRev : categoryTotalQty,
    )
    console.debug({ metric, prodTotal, catTotal, equal: prodTotal === catTotal })
  }, [
    metric,
    total,
    productTotalQty,
    productTotalRev,
    categoryTotalQty,
    categoryTotalRev,
  ])

  const legendItems = useMemo(
    () =>
      pieData.map((d, idx) => ({
        color: COLORS[idx % COLORS.length],
        name: d.name,
      })),
    [pieData],
  )

  const renderPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const entry = payload[0]
    const frac = Number(entry.percent ?? 0)
    const v = Number(entry.value) || 0
    const total = Number(entry.payload?.__total || 0)
    const pct =
      entry.percent != null
        ? frac * 100
        : total > 0
          ? (v / total) * 100
          : 0
    const formattedValue =
      metric === "revenue" ? formatRub(v) : formatInt(Math.round(v))
    const formattedPercent = `${pct.toFixed(1)}%`
    return (
      <div className="bg-white p-2 border rounded text-sm">
        <div>{entry.name}</div>
        <div>
          {formattedValue} ({formattedPercent})
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Топ товаров</h3>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1" aria-label="Метрика">
            {metricOptions.map((m) => (
              <button
                key={m.value}
                className={`px-2 py-1 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  metric === m.value
                    ? "bg-primary-500 text-white border-primary-500"
                    : "border-neutral-300"
                }`}
                onClick={() => setMetric(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1" aria-label="Количество элементов">
            {limitOptions.map((n) => (
              <button
                key={n}
                className={`px-2 py-1 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  limit === n
                    ? "bg-primary-500 text-white border-primary-500"
                    : "border-neutral-300"
                }`}
                onClick={() => setLimit(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Товары</h4>
          </div>
          <div className="h-96 relative">
            {prodError ? (
              <div className="text-error flex items-center gap-2 h-full justify-center">
                Ошибка загрузки
                <button className="underline" onClick={() => refetchProducts()}>
                  Повторить
                </button>
              </div>
            ) : prodLoading && !products ? (
              <div className="absolute inset-0 flex items-end space-x-2">
                {Array.from({ length: limit }).map((_, idx) => (
                  <div key={idx} className="flex-1 animate-pulse bg-neutral-300" />
                ))}
              </div>
            ) : topProductData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-neutral-500">
                Нет данных
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductData}
                  margin={{ top: 16, right: 8, left: 48, bottom: 16 }}
                >
                  <XAxis dataKey="name" tick={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
                  <Tooltip formatter={(v: number) => formatValue(Number(v))} />
                  <Bar
                    dataKey="value"
                    name={metricOptions.find((m) => m.value === metric)?.label}
                    fill="#3B82F6"
                    onClick={(d: any) =>
                      router.push(
                        `/products?search=${encodeURIComponent(
                          d.productName,
                        )}`,
                      )
                    }
                  >
                    {topProductData.map((_, idx) => (
                      <Cell key={idx} cursor="pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {prodFetching && products && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Категории</h4>
          </div>
          <div className="h-96 relative">
            {catError ? (
              <div className="text-error flex items-center gap-2 h-full justify-center">
                Ошибка загрузки
                <button className="underline" onClick={() => refetchCategories()}>
                  Повторить
                </button>
              </div>
            ) : catLoading && !categories ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full animate-pulse bg-neutral-300" />
              </div>
            ) : pieData.length === 0 || total === 0 ? (
              <div className="flex items-center justify-center h-full text-neutral-500">
                Нет данных
              </div>
            ) : (
              <div className="h-full flex flex-col lg:flex-row">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={1}
                        label={false}
                        labelLine={false}
                        onClick={(d: any) =>
                          router.push(`/products?categoryId=${d.categoryId}`)
                        }
                      >
                        {pieData.map((_, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                            cursor="pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={renderPieTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="mt-4 lg:mt-0 lg:ml-4 lg:w-48 text-sm"
                  style={{ maxHeight: "320px", overflowY: "auto" }}
                >
                  <ul className="space-y-1 pr-3.5">
                    {legendItems.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-center gap-2"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate">{item.name}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {catFetching && categories && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopProducts
