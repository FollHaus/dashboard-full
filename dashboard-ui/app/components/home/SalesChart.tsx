"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics/analytics.service";

const periods = [
  { label: "1 неделя", value: 7 },
  { label: "2 недели", value: 14 },
  { label: "1 месяц", value: 30 },
  { label: "1 год", value: 365 },
];

const SalesChart = () => {
  const [period, setPeriod] = useState(7);
  const { data, isFetching } = useQuery({
    queryKey: ["sales", period],
    queryFn: () => AnalyticsService.getSales(period),
    keepPreviousData: true,
  });

  const values = data?.map((d) => d.total) ?? [];
  const max = values.length ? Math.max(...values) : 0;

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Продажи</h3>
        <select
          className="border border-neutral-300 rounded p-1 text-sm"
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="relative flex items-end space-x-2 h-40">
        {data
          ? data.map((item) => (
              <div key={item.date} className="flex flex-col items-center flex-1">
                <div
                  className="bg-primary-500 w-full rounded-t"
                  style={{ height: max ? `${(item.total / max) * 100}%` : 0 }}
                ></div>
                <span className="mt-2 text-xs text-neutral-800">
                  {new Date(item.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))
          : Array.from({ length: period }).map((_, idx) => (
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
