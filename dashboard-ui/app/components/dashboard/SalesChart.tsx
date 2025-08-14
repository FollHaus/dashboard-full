"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { Period } from "./DashboardControls";

interface Props {
  period: Period;
}

const metricOptions = [
  { value: "revenue", label: "выручка" },
  { value: "sales", label: "количество продаж" },
] as const;

const daysMap: Record<Period, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

const getDates = (period: Period) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysMap[period] + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const SalesChart: React.FC<Props> = ({ period }) => {
  const [metric, setMetric] = useState<(typeof metricOptions)[number]["value"]>(
    "revenue"
  );

  const { data, isFetching } = useQuery({
    queryKey: ["sales-chart", period, metric],
    queryFn: async () => {
      if (metric === "revenue") {
        const { start, end } = getDates(period);
        return AnalyticsService.getDailyRevenue(start, end);
      }
      return AnalyticsService.getSales(daysMap[period]);
    },
    keepPreviousData: true,
  });

  const values = data?.map((d) => d.total) ?? [];
  const max = values.length ? Math.max(...values) : 0;

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
      <div className="relative flex items-end space-x-2 h-40">
        {data
          ? data.map((item) => (
              <div key={item.date} className="flex flex-col items-center flex-1">
                <div
                  className="bg-primary-500 w-full rounded-t"
                  style={{ height: max ? `${(item.total / max) * 100}%` : 0 }}
                />
                <span className="mt-2 text-xs text-neutral-800">
                  {new Date(item.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))
          : Array.from({ length: daysMap[period] }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 animate-pulse"
              >
                <div className="bg-neutral-300 w-full rounded-t h-full" />
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
