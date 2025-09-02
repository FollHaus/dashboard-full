"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaBriefcase, FaPercent, FaReceipt, FaRubleSign, FaShoppingCart } from "react-icons/fa";
import KpiCard from "@/components/ui/KpiCard";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { getPeriodRange } from "@/utils/buckets";
import { usePeriod } from "@/store/period";

type KpiData = {
  revenue: number;
  orders: number;
  avgCheck: number;
  margin: number;
};

function getPrevRange(period: any) {
  const { start, end } = getPeriodRange(period);
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
const currencyCompact = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  notation: "compact",
  compactDisplay: "short",
});
const currencyFull = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

function delta(curr: number, prev: number) {
  return ((curr - prev) / Math.max(prev, 1e-9)) * 100;
}

const KpiCards: React.FC = () => {
  const { period } = usePeriod();
  const { start, end } = getPeriodRange(period);
  const prevRange = getPrevRange(period);

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
      title: "💰 Финансовые",
      items: [
        {
          label: "Выручка",
          value: currencyCompact.format(revenue),
          valueTitle: currencyFull.format(revenue),
          valueClass: "text-success",
          delta: delta(revenue, prevRevenue),
          icon: <FaRubleSign className="text-success" />,
        },
        {
          label: "Фин. итог",
          value: currencyCompact.format(profit),
          valueTitle: currencyFull.format(profit),
          valueClass: profit >= 0 ? "text-success" : "text-error",
          delta: delta(profit, prevProfit),
          icon: <FaBriefcase className={profit >= 0 ? "text-success" : "text-error"} />,
        },
        {
          label: "Маржа",
          value: `${marginPct.toFixed(1).replace('.', ',')}%`,
          valueTitle: `${marginPct.toFixed(2).replace('.', ',')}%`,
          valueClass: marginPct >= 0 ? "text-success" : "text-error",
          delta: delta(marginPct, prevMarginPct),
          icon: <FaPercent className={marginPct >= 0 ? "text-success" : "text-error"} />,
        },
      ],
    },
    {
      title: "📦 Операционные",
      items: [
        {
          label: "Кол-во продаж",
          value: numberCompact.format(orders),
          valueTitle: numberFull.format(orders),
          valueClass: "text-info",
          delta: delta(orders, prevOrders),
          icon: <FaShoppingCart className="text-info" />,
        },
        {
          label: "Средний чек",
          value: currencyCompact.format(avg),
          valueTitle: currencyFull.format(avg),
          valueClass: "text-warning",
          delta: delta(avg, prevAvg),
          icon: <FaReceipt className="text-warning" />,
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:gap-8">
      {groups.map((g) => (
        <div
          key={g.title}
          className="rounded-2xl bg-neutral-200 shadow-card p-4 relative"
        >
          <h3 className="text-lg font-semibold mb-4">{g.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {g.items.map((item) => (
              <KpiCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                valueTitle={item.valueTitle}
                valueClassName={item.valueClass}
                isLoading={isLoading && !curr}
                deltaPct={item.delta}
              />
            ))}
          </div>
          {isFetching && curr && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
