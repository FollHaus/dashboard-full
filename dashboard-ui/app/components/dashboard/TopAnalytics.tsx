"use client";

import React, { useMemo, useState } from "react";
import cn from "classnames";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { getPeriodRange } from "@/utils/buckets";
import { useDashboardFilter, DEFAULT_FILTER } from "@/store/dashboardFilter";

const formatDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const intFmt = new Intl.NumberFormat("ru-RU");

type Metric = "revenue" | "quantity";

interface Props {
  limit?: number;
}

const COLORS = [
  "#2563EB",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#10B981",
  "#34D399",
  "#6EE7B7",
  "#A7F3D0",
  "#059669",
  "#047857",
];

const TopAnalytics: React.FC<Props> = ({ limit = 5 }) => {
  const { filter: ctxFilter } = useDashboardFilter();
  const filter = ctxFilter ?? DEFAULT_FILTER;
  const { start, end } = getPeriodRange(filter);
  const s = formatDate(start);
  const e = formatDate(end);
  const [metric, setMetric] = useState<Metric>("revenue");
  const [tab, setTab] = useState<"products" | "categories">("products");

  const {
    data: prodData,
    isLoading: prodLoading,
    isFetching: prodFetching,
    error: prodError,
    refetch: prodRefetch,
  } = useQuery({
    queryKey: ["top-products", s, e],
    queryFn: () => AnalyticsService.getTopProducts(limit, s, e),
    keepPreviousData: true,
  });

  const {
    data: catData,
    isLoading: catLoading,
    isFetching: catFetching,
    error: catError,
    refetch: catRefetch,
  } = useQuery({
    queryKey: ["category-sales", s, e],
    queryFn: () => AnalyticsService.getCategorySales(s, e),
    keepPreviousData: true,
  });

  const isLoading = prodLoading || catLoading;
  const isFetching = prodFetching || catFetching;
  const error = prodError || catError;

  const products = useMemo(
    () =>
      (prodData ?? []).map((row: any, idx: number) => ({
        idx: idx + 1,
        name: String(row.productName ?? ""),
        revenue: Number(row.totalRevenue ?? 0),
        quantity: Number(row.totalUnits ?? 0),
      })),
    [prodData],
  );

  const barData = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        value: metric === "revenue" ? p.revenue : p.quantity,
      })),
    [products, metric],
  );

  const categories = useMemo(
    () =>
      (catData ?? []).map((row: any) => ({
        name: String(row.categoryName ?? ""),
        revenue: Number(row.totalRevenue ?? 0),
        quantity: Number(row.totalUnits ?? 0),
      })),
    [catData],
  );

  const pieData = useMemo(() => {
    if (!categories.length) return [] as any[];
    const total = categories.reduce((sum, c) => sum + c[metric], 0);
    if (!total) return [] as any[];
    const sorted = [...categories].sort((a, b) => b[metric] - a[metric]);
    const top = sorted.slice(0, limit);
    const topSum = top.reduce((sum, c) => sum + c[metric], 0);
    if (topSum < total)
      top.push({
        name: "Другое",
        revenue: metric === "revenue" ? total - topSum : 0,
        quantity: metric === "quantity" ? total - topSum : 0,
      });
    return top.map((c) => ({
      name: c.name,
      value: c[metric],
      percent: (c[metric] / total) * 100,
    }));
  }, [categories, metric, limit]);

  const formatValue = (v: number) =>
    metric === "revenue" ? currency.format(v) : intFmt.format(v);

  if (error) {
    return (
      <section className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 mb-6 md:mb-8 text-error flex items-center gap-2">
        Ошибка загрузки
        <button
          className="underline"
          onClick={() => {
            prodRefetch()
            catRefetch()
          }}
        >
          Повторить
        </button>
      </section>
    )
  }

  if (isLoading) {
    return <section className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 mb-6 md:mb-8" />
  }

  return (
    <section className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 mb-6 md:mb-8 overflow-visible">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">🏆 Топ-аналитика</h2>
        <div className="flex gap-2">
          {(["revenue", "quantity"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                "h-8 px-3 rounded-full text-sm font-medium",
                metric === m
                  ? "bg-primary-500 text-neutral-50"
                  : "bg-neutral-100 hover:bg-neutral-300",
              )}
              aria-pressed={metric === m}
            >
              {m === "revenue" ? "Выручка" : "Количество"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          className={cn(
            "px-3 py-1.5 rounded-full text-sm",
            tab === "products"
              ? "bg-primary-500 text-neutral-50"
              : "bg-neutral-100 hover:bg-neutral-300",
          )}
          onClick={() => setTab("products")}
          aria-pressed={tab === "products"}
        >
          По продуктам
        </button>
        <button
          className={cn(
            "px-3 py-1.5 rounded-full text-sm",
            tab === "categories"
              ? "bg-primary-500 text-neutral-50"
              : "bg-neutral-100 hover:bg-neutral-300",
          )}
          onClick={() => setTab("categories")}
          aria-pressed={tab === "categories"}
        >
          По категориям
        </button>
      </div>

      {tab === "products" && (
        <div className="w-full">
          {barData.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 8, right: 12, bottom: 8, left: 56 }}>
                <XAxis dataKey="idx" />
                <YAxis tickFormatter={formatValue} width={56} />
                <ReTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null
                    const p = payload[0].payload as any
                    return (
                      <div className="bg-white p-2 rounded shadow text-sm">
                        <div>Товар: {p.name}</div>
                        <div>
                          {metric === "revenue" ? "Выручка" : "Количество"}: {formatValue(p.value)}
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={metric === "revenue" ? "#10B981" : "#3B82F6"} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-neutral-500">
              Нет данных за период
            </div>
          )}
        </div>
      )}

      {tab === "categories" && (
        <div className="w-full">
          {pieData.length ? (
            <div className="flex items-center">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const p = payload[0].payload as any
                      return (
                        <div className="bg-white p-2 rounded shadow text-sm">
                          <div>Категория: {p.name}</div>
                          <div>Доля: {p.percent.toFixed(1)}%</div>
                          <div>
                            {metric === "revenue" ? "Выручка" : "Кол-во"}: {formatValue(p.value)}
                          </div>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="ml-4 text-sm max-h-56 overflow-auto">
                {pieData.map((p, idx) => (
                  <li key={p.name} className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-neutral-500">
              Нет данных за период
            </div>
          )}
        </div>
      )}

      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </section>
  )
}

export default TopAnalytics;
