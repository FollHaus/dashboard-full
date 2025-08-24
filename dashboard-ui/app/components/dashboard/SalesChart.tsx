"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { buildBuckets, getPeriodRange } from "@/utils/buckets";
import { usePeriod } from "@/store/period";

const metricOptions = [
  { value: "revenue", label: "Выручка" },
  { value: "sales", label: "Количество" },
] as const;

const SalesChart: React.FC = () => {
  const { period } = usePeriod();
  const [metric, setMetric] = useState<(typeof metricOptions)[number]["value"]>(
    "revenue"
  );
  const { start, end } = getPeriodRange(period);

  const formatDate = (date: Date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };

  const {
    data,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "sales-chart",
      metric,
      period,
      formatDate(start),
      formatDate(end),
    ],
    queryFn: async () => {
      const s = formatDate(start);
      const e = formatDate(end);
      if (metric === "revenue") {
        return AnalyticsService.getDailyRevenue(s, e);
      }
      return AnalyticsService.getSales(s, e);
    },
    keepPreviousData: true,
  });

  const buckets = buildBuckets({ start, end }, period);
  const map = new Map<string, number>();
  (data ?? []).forEach((d) => {
    const key = period === "year" ? d.date.slice(0, 7) : d.date.slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + d.total);
  });
  const chartData = buckets.map((b) => ({ ...b, value: map.get(b.key) ?? 0 }));
  const allZero = chartData.every((d) => d.value === 0);
  const maxValue = Math.max(...chartData.map((d) => d.value), 0);
  const step =
    metric === "revenue"
      ? Math.max(1, Math.round(maxValue / 5 / 100000)) * 100000
      : Math.max(1, Math.round(maxValue / 5));
  const ticks = Array.from(
    { length: Math.floor(maxValue / step) + 1 },
    (_, i) => i * step
  );

  const currency = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });

  const formatValue = (v: number) =>
    metric === "revenue" ? currency.format(v) : v.toLocaleString("ru-RU");

  if (error) {
    return (
      <div className="bg-neutral-200 p-4 md:p-5 rounded-2xl shadow-card text-error flex items-center gap-2">
        Ошибка загрузки
        <button className="underline" onClick={() => refetch()}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-200 p-4 md:p-5 rounded-2xl shadow-card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">📊 Продажи</h3>
        <div className="flex gap-2">
          {metricOptions.map((m) => (
            <button
              key={m.value}
              className={`px-2 py-1 text-sm rounded border ${
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
      </div>
      <div className="h-64 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-end space-x-2">
            {buckets.map((_, idx) => (
              <div key={idx} className="flex-1 animate-pulse bg-neutral-300" />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 8, right: 8, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                tickFormatter={formatValue}
                ticks={ticks}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => formatValue(Number(value))}
                labelFormatter={(label) => label}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metric === "revenue" ? "#3B82F6" : "#10B981"}
                strokeWidth={2}
                dot={false}
                name={metricOptions.find((m) => m.value === metric)?.label}
                isAnimationActive
              />
              {allZero && <ReferenceLine y={0} stroke="#EF4444" strokeWidth={1} />}
            </LineChart>
          </ResponsiveContainer>
        )}
        {allZero && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
            Нет данных
          </div>
        )}
        {isFetching && data && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
