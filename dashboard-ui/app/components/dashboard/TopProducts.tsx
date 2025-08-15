"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AnalyticsService } from "@/services/analytics/analytics.service"
import { Period } from "./DashboardControls"
import { getPeriodRange } from "@/utils/buckets"

interface Props {
  period: Period
}

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

const formatDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)

const TopProducts: React.FC<Props> = ({ period }) => {
  const router = useRouter()
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
    queryKey: ["top-products", s, e, metric, limit],
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
    queryKey: ["category-sales", s, e, metric, limit],
    queryFn: () => AnalyticsService.getCategorySales(s, e),
    keepPreviousData: true,
    placeholderData: (prev) => prev,
  })

  const topProductData = useMemo(() => {
    const items = [...(products ?? [])]
    items.sort((a, b) =>
      metric === "revenue"
        ? b.totalRevenue - a.totalRevenue
        : b.totalUnits - a.totalUnits,
    )
    return items.slice(0, limit).map((p) => ({
      name: p.productName,
      value: metric === "revenue" ? p.totalRevenue : p.totalUnits,
      productId: p.productId,
      productName: p.productName,
    }))
  }, [products, metric, limit])

  const pieData = useMemo(() => {
    const items = [...(categories ?? [])]
    items.sort((a, b) =>
      metric === "revenue"
        ? b.totalRevenue - a.totalRevenue
        : b.totalUnits - a.totalUnits,
    )
    const sliced = items.slice(0, limit)
    if (items.length > limit) {
      const others = items.slice(limit)
      const othersValue = others.reduce(
        (sum, c) =>
          sum + (metric === "revenue" ? c.totalRevenue : c.totalUnits),
        0,
      )
      if (othersValue > 0) {
        sliced.push({
          categoryId: 0,
          categoryName: "Прочее",
          totalUnits: metric === "quantity" ? othersValue : 0,
          totalRevenue: metric === "revenue" ? othersValue : 0,
        })
      }
    }
    return sliced
      .map((c) => {
        const value = Number(
          metric === "revenue" ? c.totalRevenue : c.totalUnits,
        )
        if (isNaN(value)) return null
        return { name: c.categoryName, value, categoryId: c.categoryId }
      })
      .filter(Boolean) as { name: string; value: number; categoryId: number }[]
  }, [categories, metric, limit])

  const formatValue = metric === "revenue" ? formatRub : formatInt
  const total = pieData.reduce(
    (sum, d) => sum + (Number(d.value) || 0),
    0,
  )
  const legendPayload = pieData.map((d, idx) => ({
    value: d.name,
    color: COLORS[idx % COLORS.length],
    type: "square" as const,
  }))

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
                        `/products?searchName=${encodeURIComponent(
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
                      <Tooltip formatter={(v: number) => formatValue(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="mt-4 lg:mt-0 lg:ml-4 lg:w-48"
                  style={{ maxHeight: "320px", overflowY: "auto" }}
                >
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    payload={legendPayload}
                  />
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
