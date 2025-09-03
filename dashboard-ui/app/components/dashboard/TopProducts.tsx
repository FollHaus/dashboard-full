"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { getPeriodRange } from "@/utils/buckets";
import { useDashboardFilter } from "@/store/dashboardFilter";

const formatDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});
const intFmt = new Intl.NumberFormat("ru-RU");

const options = [
  { value: "revenue", label: "Выручка" },
  { value: "quantity", label: "Количество" },
  { value: "profit", label: "Прибыль" },
] as const;

type Metric = (typeof options)[number]["value"];

const TopProducts: React.FC = () => {
  const { filter } = useDashboardFilter();
  const { period } = filter;
  const { start, end } = getPeriodRange(filter);
  const s = formatDate(start);
  const e = formatDate(end);
  const [metric, setMetric] = useState<Metric>("revenue");

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["top-products", period, s, e, metric],
    queryFn: () => AnalyticsService.getTopProducts(50, s, e),
    keepPreviousData: true,
  });

  const items = useMemo(() => {
    return (data ?? []).map((row: any) => {
      const revenue = Number(row.totalRevenue ?? row.revenue ?? 0);
      const quantity = Number(row.totalUnits ?? row.quantity ?? 0);
      const profit =
        "profit" in row
          ? Number(row.profit)
          : revenue - Number(row.purchaseCostPortion ?? 0);
      return {
        name: String(row.productName ?? ""),
        revenue,
        quantity,
        profit,
      };
    });
  }, [data]);

  const top = useMemo(() => {
    const sorted = [...items].sort((a, b) => b[metric] - a[metric]);
    return sorted.slice(0, 10).map((it) => ({
      ...it,
      short: it.name.length > 18 ? it.name.slice(0, 18) + "…" : it.name,
    }));
  }, [items, metric]);

  const formatValue = (v: number) =>
    metric === "quantity" ? intFmt.format(v) : currency.format(v);

  if (error) {
    return (
      <div className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 text-error flex items-center gap-2">
        Ошибка загрузки
        <button className="underline" onClick={() => refetch()}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h3 className="text-lg font-semibold">🏆 Топ товаров</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm">Сортировка:</span>
          <select
            className="border border-neutral-300 rounded px-2 py-1 text-sm"
            value={metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isLoading && !data ? (
        <div className="h-64 flex items-end space-x-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 h-full bg-neutral-300 animate-pulse" />
          ))}
        </div>
      ) : top.length ? (
        <div className="relative" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top} layout="vertical" margin={{ left: 16, right: 16 }}>
              <XAxis
                type="number"
                tickFormatter={formatValue}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="short"
                type="category"
                width={160}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: any) => formatValue(Number(value))}
                labelFormatter={(label, payload) =>
                  (payload && payload[0] && (payload[0].payload as any).name) ||
                  label
                }
              />
              <Bar
                dataKey={metric}
                radius={[4, 4, 4, 4]}
                barSize={20}
                fill={metric === "quantity" ? "#3B82F6" : "#10B981"}
              />
            </BarChart>
          </ResponsiveContainer>
          {isFetching && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-neutral-500">
          Нет данных за период
        </div>
      )}
    </div>
  );
};

export default TopProducts;
