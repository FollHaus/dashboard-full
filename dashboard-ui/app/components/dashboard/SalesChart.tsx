"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { buildBuckets, getPeriodRange, MONTH_LABELS } from "@/utils/buckets";
import { useDashboardFilter } from "@/store/dashboardFilter";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const intFmt = new Intl.NumberFormat("ru-RU");

const formatDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const SalesChart: React.FC = () => {
  const { filter } = useDashboardFilter();
  const { period } = filter;
  const { start, end } = getPeriodRange(filter);
  const s = formatDate(start);
  const e = formatDate(end);

  const {
    data: revenueData,
    isLoading: revLoading,
    isFetching: revFetching,
    error: revError,
    refetch: refetchRev,
  } = useQuery({
    queryKey: ["daily-revenue", period, s, e],
    queryFn: () => AnalyticsService.getDailyRevenue(s, e),
    keepPreviousData: true,
  });

  const {
    data: qtyData,
    isLoading: qtyLoading,
    isFetching: qtyFetching,
    error: qtyError,
    refetch: refetchQty,
  } = useQuery({
    queryKey: ["sales", period, s, e],
    queryFn: () => AnalyticsService.getSales(s, e),
    keepPreviousData: true,
  });

  const loading = revLoading || qtyLoading;
  const fetching = revFetching || qtyFetching;
  const error = revError || qtyError;

  const buckets = buildBuckets({ start, end }, period);
  const mapRev = new Map<string, number>();
  (revenueData ?? []).forEach((d: any) => {
    const key = period === "year" ? d.date.slice(0, 7) : d.date.slice(0, 10);
    mapRev.set(key, (mapRev.get(key) ?? 0) + d.total);
  });
  const mapQty = new Map<string, number>();
  (qtyData ?? []).forEach((d: any) => {
    const key = period === "year" ? d.date.slice(0, 7) : d.date.slice(0, 10);
    mapQty.set(key, (mapQty.get(key) ?? 0) + d.total);
  });
  const chartData = buckets.map((b) => ({
    ...b,
    revenue: mapRev.get(b.key) ?? 0,
    quantity: mapQty.get(b.key) ?? 0,
  }));

  const hasData = chartData.some((d) => d.revenue !== 0 || d.quantity !== 0);

  const MONTH_TICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const showAllTicks = chartData.length <= 15;

  if (error) {
    return (
      <div className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 text-error flex items-center gap-2">
        Ошибка загрузки
        <button className="underline" onClick={() => { refetchRev(); refetchQty(); }}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5">
      <h3 className="text-lg font-semibold mb-4">📊 Продажи</h3>
      <div className="relative h-[340px]">
        {loading ? (
          <div className="absolute inset-0 flex items-end space-x-2">
            {buckets.map((_, idx) => (
              <div key={idx} className="flex-1 animate-pulse bg-neutral-300" />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 72 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              {period === "year" ? (
                <XAxis
                  dataKey="monthIndex"
                  ticks={MONTH_TICKS}
                  tickFormatter={(i) => MONTH_LABELS[i]}
                  stroke="#645c4d"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  height={36}
                  allowDecimals={false}
                />
              ) : (
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  stroke="#645c4d"
                  tick={{ fontSize: 12 }}
                  interval={showAllTicks ? 0 : undefined}
                  minTickGap={showAllTicks ? undefined : 8}
                  preserveStartEnd
                />
              )}
              <YAxis
                yAxisId="left"
                width={80}
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                stroke="#645c4d"
                tickFormatter={(v) =>
                  new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format(v ?? 0)
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => intFmt.format(Number(v))}
                width={48}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: any, name) => {
                  if (name === "revenue")
                    return [currency.format(Number(value)), "Доход"];
                  if (name === "quantity")
                    return [intFmt.format(Number(value)), "Количество"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Дата: ${label}`}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="quantity" yAxisId="right" barSize={20} fill="#3B82F6" />
              <Line
                type="monotone"
                dataKey="revenue"
                yAxisId="left"
                stroke="#10B981"
                strokeWidth={2}
                dot
              />
              {!hasData && (
                <ReferenceLine y={0} yAxisId="left" stroke="#8a8578" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {!hasData && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
            Нет данных
          </div>
        )}
        {fetching && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
