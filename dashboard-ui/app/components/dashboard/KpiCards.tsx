"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import KpiCard from "@/components/ui/KpiCard";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { getPeriodRange } from "@/utils/buckets";
import { useDashboardFilter, DEFAULT_FILTER } from "@/store/dashboardFilter";

type KpiData = {
  revenue: number;
  orders: number;
  avgCheck: number;
  margin: number;
};

function getPrevRange(period: any, filter: any) {
  const { start, end } = getPeriodRange(filter);
  switch (period) {
    case "day": {
      const prev = new Date(start);
      prev.setDate(prev.getDate() - 1);
      return { start: prev, end: prev };
    }
    case "week": {
      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 6);
      return { start: prevStart, end: prevEnd };
    }
    case "month": {
      const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
      const prevEnd = new Date(start.getFullYear(), start.getMonth(), 0);
      return { start: prevStart, end: prevEnd };
    }
    case "year": {
      const prevStart = new Date(start.getFullYear() - 1, 0, 1);
      const prevEnd = new Date(start.getFullYear() - 1, 11, 31);
      return { start: prevStart, end: prevEnd };
    }
    default:
      return { start, end };
  }
}

const numberCompact = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  compactDisplay: "short",
});
const numberFull = new Intl.NumberFormat("ru-RU");
const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

function delta(curr: number, prev: number) {
  return (curr - prev) / Math.max(prev, 1e-9);
}

const KpiCards: React.FC = () => {
  const { filter: ctxFilter } = useDashboardFilter();
  const filter = ctxFilter ?? DEFAULT_FILTER;
  const { period } = filter;
  const { start, end } = getPeriodRange(filter);
  const prevRange = getPrevRange(period, filter);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const prevStartStr = prevRange.start.toISOString().slice(0, 10);
  const prevEndStr = prevRange.end.toISOString().slice(0, 10);

  const {
    data: curr,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<KpiData>({
    queryKey: ["kpi", period, startStr, endStr],
    queryFn: () => AnalyticsService.getKpis(startStr, endStr),
    keepPreviousData: true,
  });
  const { data: prev } = useQuery<KpiData>({
    queryKey: ["kpi", period, prevStartStr, prevEndStr],
    queryFn: () => AnalyticsService.getKpis(prevStartStr, prevEndStr),
    keepPreviousData: true,
  });

  if (error) {
    return (
      <div className="text-error flex items-center gap-2">
        Ошибка загрузки
        <button className="underline" onClick={() => refetch()}>
          Повторить
        </button>
      </div>
    );
  }

  const revenue = curr?.revenue ?? 0;
  const prevRevenue = prev?.revenue ?? 0;
  const profit = curr?.margin ?? 0;
  const prevProfit = prev?.margin ?? 0;
  const marginPct = revenue ? (profit / revenue) * 100 : 0;
  const prevMarginPct = prevRevenue ? (prevProfit / prevRevenue) * 100 : 0;
  const orders = curr?.orders ?? 0;
  const prevOrders = prev?.orders ?? 0;
  const avg = curr?.avgCheck ?? (orders ? revenue / orders : 0);
  const prevAvg = prev?.avgCheck ?? (prevOrders ? prevRevenue / prevOrders : 0);

  const groups = [
    {
      title: "💰 Финансовые KPI",
      grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4",
      items: [
        {
          title: "Выручка",
          icon: "💰",
          value: currency.format(revenue),
          delta: delta(revenue, prevRevenue),
        },
        {
          title: "Финансовый итог",
          icon: "📈",
          value: currency.format(profit),
          delta: delta(profit, prevProfit),
        },
        {
          title: "Маржа",
          icon: "📊",
          value: `${marginPct.toFixed(1).replace('.', ',')}%`,
          delta: delta(marginPct, prevMarginPct),
        },
      ],
    },
    {
      title: "📦 Операционные KPI",
      grid: "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4",
      items: [
        {
          title: "Кол-во продаж",
          icon: "🛒",
          value: numberCompact.format(orders),
          delta: delta(orders, prevOrders),
        },
        {
          title: "Средний чек",
          icon: "💳",
          value: currency.format(avg),
          delta: delta(avg, prevAvg),
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:gap-8">
      {groups.map((g) => (
        <section
          key={g.title}
          className="relative rounded-2xl bg-neutral-200 shadow-card p-5 space-y-4"
        >
          <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            {g.title}
          </h2>
          <div className={g.grid}>
            {g.items.map((item) => (
              <KpiCard
                key={item.title}
                title={item.title}
                icon={item.icon}
                value={item.value}
                accent={item.delta < 0 ? 'error' : item.delta > 0 ? 'success' : 'neutral'}
              />
            ))}
          </div>
          {isFetching && curr && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default KpiCards;
