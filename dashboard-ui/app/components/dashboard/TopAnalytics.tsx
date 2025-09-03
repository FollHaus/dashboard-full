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
type TopN = 5 | 10 | 15;

const TopAnalytics: React.FC = () => {
  const { filter: ctxFilter } = useDashboardFilter();
  const filter = ctxFilter ?? DEFAULT_FILTER;
  const { start, end } = getPeriodRange(filter);
  const s = formatDate(start);
  const e = formatDate(end);
  const [state, setState] = useState<{ metric: Metric; topN: TopN }>({
    metric: "revenue",
    topN: 5,
  });

  const {
    data: prodData,
    isLoading: prodLoading,
    isFetching: prodFetching,
    error: prodError,
    refetch: prodRefetch,
  } = useQuery({
    queryKey: ["top-products", s, e, state.topN],
    queryFn: () => AnalyticsService.getTopProducts(state.topN, s, e),
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

  const products = useMemo(() => {
    const items = (prodData ?? []).map((row: any) => ({
      name: String(row.productName ?? ""),
      revenue: Number(row.totalRevenue ?? 0),
      quantity: Number(row.totalUnits ?? 0),
    }));
    const sorted = [...items]
      .sort((a, b) => b[state.metric] - a[state.metric])
      .slice(0, state.topN);
    return sorted.map((p, idx) => ({
      ...p,
      idx: idx + 1,
      value: state.metric === "revenue" ? p.revenue : p.quantity,
    }));
  }, [prodData, state.metric, state.topN]);

  const categories = useMemo(() => {
    const items = (catData ?? []).map((row: any) => ({
      name: String(row.categoryName ?? ""),
      revenue: Number(row.totalRevenue ?? 0),
      quantity: Number(row.totalUnits ?? 0),
    }));
    const sorted = [...items]
      .sort((a, b) => b[state.metric] - a[state.metric])
      .slice(0, state.topN);
    return sorted.map((c, idx) => ({
      ...c,
      idx: idx + 1,
      value: state.metric === "revenue" ? c.revenue : c.quantity,
    }));
  }, [catData, state.metric, state.topN]);

  const formatValue = (v: number) =>
    state.metric === "revenue" ? currency.format(v) : intFmt.format(v);

  return (
    <section className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 mb-6 md:mb-8 overflow-visible">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 mb-3">
        🏆 Топ-аналитика
      </h2>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(["revenue", "quantity"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setState((s) => ({ ...s, metric: m }))}
            className={cn(
              "h-9 px-3 rounded-full text-sm font-medium",
              state.metric === m
                ? "bg-primary-500 text-neutral-50"
                : "bg-neutral-100 hover:bg-neutral-300",
            )}
            aria-pressed={state.metric === m}
          >
            {m === "revenue" ? "Выручка" : "Количество"}
          </button>
        ))}
        <select
          value={state.topN}
          onChange={(e) =>
            setState((st) => ({ ...st, topN: Number(e.target.value) as TopN }))
          }
          className="h-9 px-3 rounded-full text-sm bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {[5, 10, 15].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="text-error flex items-center gap-2">
          Ошибка загрузки
          <button
            className="underline"
            onClick={() => {
              prodRefetch();
              catRefetch();
            }}
          >
            Повторить
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-[320px]" />
          <div className="h-[320px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-2">
              Топ-{state.topN} продуктов
            </h3>
            {products.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={products}
                  margin={{ top: 16, right: 16, left: 16, bottom: 32 }}
                >
                  <XAxis dataKey="idx" />
                  <YAxis tickFormatter={formatValue} />
                  <ReTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload as any;
                      return (
                        <div className="bg-white p-2 rounded shadow text-sm">
                          <div>Товар: {p.name}</div>
                          <div>
                            {state.metric === "revenue"
                              ? "Выручка"
                              : "Количество"}: {formatValue(p.value)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    fill={state.metric === "revenue" ? "#10B981" : "#3B82F6"}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-neutral-500 border-t border-neutral-300">
                Нет данных за период
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-2">
              Топ-{state.topN} категорий
            </h3>
            {categories.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={categories}
                  margin={{ top: 16, right: 16, left: 16, bottom: 32 }}
                >
                  <XAxis dataKey="idx" />
                  <YAxis tickFormatter={formatValue} />
                  <ReTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload as any;
                      return (
                        <div className="bg-white p-2 rounded shadow text-sm">
                          <div>Категория: {p.name}</div>
                          <div>
                            {state.metric === "revenue"
                              ? "Выручка"
                              : "Количество"}: {formatValue(p.value)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    fill={state.metric === "revenue" ? "#10B981" : "#3B82F6"}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-neutral-500 border-t border-neutral-300">
                Нет данных за период
              </div>
            )}
          </div>
        </div>
      )}

      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
};

export default TopAnalytics;

