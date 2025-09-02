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
import { buildBuckets, getPeriodRange } from "@/utils/buckets";
import { usePeriod } from "@/store/period";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});
const intFmt = new Intl.NumberFormat("ru-RU");

const formatDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const SalesChart: React.FC = () => {
  const { period } = usePeriod();
  const { start, end } = getPeriodRange(period);
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

  const allZero = chartData.every((d) => d.revenue === 0 && d.quantity === 0);

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
      <div className="relative" style={{ height: 360 }}>
        {loading ? (
          <div className="absolute inset-0 flex items-end space-x-2">
            {buckets.map((_, idx) => (
              <div key={idx} className="flex-1 animate-pulse bg-neutral-300" />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 8, bottom: 5, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => currency.format(Number(v))}
                width={72}
                tickLine={false}
                axisLine={false}
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
                formatter={(value: any, name) =>
                  name === "revenue"
                    ? currency.format(Number(value))
                    : `${intFmt.format(Number(value))} шт`}
                labelFormatter={(label) => label}
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
              {allZero && <ReferenceLine y={0} stroke="#EF4444" strokeWidth={1} />}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {allZero && !loading && (
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
