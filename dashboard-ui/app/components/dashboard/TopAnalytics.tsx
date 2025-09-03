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
type Scope = "products" | "categories";
type TopN = 5 | 10 | 15;

const TopAnalytics: React.FC = () => {
  const { filter: ctxFilter } = useDashboardFilter();
  const filter = ctxFilter ?? DEFAULT_FILTER;
  const { start, end } = getPeriodRange(filter);
  const s = formatDate(start);
  const e = formatDate(end);
  const [metric, setMetric] = useState<Metric>("revenue");
  const [scope, setScope] = useState<Scope>("products");
  const [topN, setTopN] = useState<TopN>(5);

  const {
    data: prodData,
    isLoading: prodLoading,
    isFetching: prodFetching,
    error: prodError,
    refetch: prodRefetch,
  } = useQuery({
    queryKey: ["top-products", s, e, topN],
    queryFn: () => AnalyticsService.getTopProducts(topN, s, e),
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
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, topN);
    return sorted.map((p) => ({
      ...p,
      value: metric === "revenue" ? p.revenue : p.quantity,
    }));
  }, [prodData, metric, topN]);

  const categories = useMemo(() => {
    const items = (catData ?? []).map((row: any) => ({
      name: String(row.categoryName ?? ""),
      revenue: Number(row.totalRevenue ?? 0),
      quantity: Number(row.totalUnits ?? 0),
    }));
    const sorted = [...items]
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, topN);
    return sorted.map((c) => ({
      ...c,
      value: metric === "revenue" ? c.revenue : c.quantity,
    }));
  }, [catData, metric, topN]);

  const formatValue = (v: number) =>
    metric === "revenue" ? currency.format(v) : intFmt.format(v);

  const truncate = (s: string, n = 12) =>
    s.length > n ? `${s.slice(0, n)}…` : s;

  const data = scope === "products" ? products : categories;
  const color = metric === "revenue" ? "#10B981" : "#3B82F6";

  return (
    <section className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 mb-6 md:mb-8 overflow-visible">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 mb-3">
        🏆 Топ-аналитика
      </h2>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(["revenue", "quantity"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={cn(
              "h-9 px-3 rounded-full text-sm font-medium",
              metric === m
                ? "bg-primary-500 text-neutral-50"
                : "bg-neutral-100 hover:bg-neutral-300",
            )}
            aria-pressed={metric === m}
          >
            {m === "revenue" ? "Выручка" : "Количество"}
          </button>
        ))}
        {(["products", "categories"] as Scope[]).map((sc) => (
          <button
            key={sc}
            onClick={() => setScope(sc)}
            className={cn(
              "h-9 px-3 rounded-full text-sm font-medium",
              scope === sc
                ? "bg-primary-500 text-neutral-50"
                : "bg-neutral-100 hover:bg-neutral-300",
            )}
            aria-pressed={scope === sc}
          >
            {sc === "products" ? "По товарам" : "По категориям"}
          </button>
        ))}
        {[5, 10, 15].map((n) => (
          <button
            key={n}
            onClick={() => setTopN(n as TopN)}
            className={cn(
              "h-9 px-3 rounded-full text-sm font-medium",
              topN === n
                ? "bg-primary-500 text-neutral-50"
                : "bg-neutral-100 hover:bg-neutral-300",
            )}
            aria-pressed={topN === n}
          >
            {n}
          </button>
        ))}
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
        <div className="h-[340px]" />
      ) : (
        <div>
          <h3 className="text-base font-medium text-neutral-900 mb-2">
            Топ-{topN} {scope === "products" ? "товаров" : "категорий"}
          </h3>
          {data.length ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={data}
                margin={{ top: 12, right: 16, bottom: 36, left: 64 }}
              >
                <XAxis dataKey="name" tickFormatter={truncate} />
                <YAxis tickFormatter={formatValue} />
                <ReTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as any;
                    return (
                      <div className="bg-white p-2 rounded shadow text-sm">
                        <div>{scope === "products" ? "Товар" : "Категория"}: {p.name}</div>
                        <div>
                          {metric === "revenue" ? "Выручка" : "Количество"}: {formatValue(p.value)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  fill={color}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="relative h-[340px]">
              <div className="absolute inset-x-0 bottom-9 h-px bg-neutral-300" />
              <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                Нет данных за период
              </div>
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
  );
};

export default TopAnalytics;

