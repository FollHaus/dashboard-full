"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { Period } from "./DashboardControls";
import { buildBuckets, getPeriodRange } from "@/utils/buckets";

interface Props {
  period: Period;
}

const metricOptions = [
  { value: "revenue", label: "Выручка" },
  { value: "sales", label: "Количество" },
] as const;

const SalesChart: React.FC<Props> = ({ period }) => {
  const [metric, setMetric] = useState<(typeof metricOptions)[number]["value"]>(
    "revenue"
  );
  const { start, end } = getPeriodRange(period);
  const today = new Date();
  const days =
    Math.floor(
      (Math.min(today.getTime(), end.getTime()) - start.getTime()) / 86400000
    ) + 1;

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
      start.toISOString(),
      end.toISOString(),
    ],
    queryFn: async () => {
      if (metric === "revenue") {
        return AnalyticsService.getDailyRevenue(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        );
      }
      return AnalyticsService.getSales(days);
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
  const values = chartData.map((d) => d.value);
  const max = values.length ? Math.max(...values) : 0;
  const allZero = chartData.every((d) => d.value === 0);

  if (error) {
    return (
      <div className="bg-neutral-100 p-4 rounded-card shadow-card text-error flex items-center gap-2">
        Ошибка загрузки
        <button className="underline" onClick={() => refetch()}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Продажи</h3>
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
      <div
        className={`relative flex items-end space-x-2 h-40 border-b ${
          allZero ? "border-red-500" : "border-neutral-300"
        }`}
      >
        {isLoading
          ? buckets.map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 animate-pulse"
              >
                <div className="bg-neutral-300 w-full rounded-t h-full" />
              </div>
            ))
          : chartData.map((item) => (
              <div key={item.key} className="flex flex-col items-center flex-1">
                <div
                  className="bg-primary-500 w-full rounded-t"
                  style={{ height: max ? `${(item.value / max) * 100}%` : 0 }}
                  title={item.value.toString()}
                />
                <span className="mt-2 text-xs text-neutral-800">{item.label}</span>
              </div>
            ))}
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
