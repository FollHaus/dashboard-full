"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { Period } from "./DashboardControls";
import { getPeriodRange } from "@/utils/buckets";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

interface Props {
  period: Period;
}

const KpiCards: React.FC<Props> = ({ period }) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["kpi", period],
    queryFn: async () => {
      const { start, end } = getPeriodRange(period);
      const today = new Date();
      const days =
        Math.floor(
          (Math.min(today.getTime(), end.getTime()) - start.getTime()) /
            86400000
        ) + 1;
      const [revenueData, salesData] = await Promise.all([
        AnalyticsService.getDailyRevenue(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        ),
        AnalyticsService.getSales(days),
      ]);
      const revenue = revenueData.reduce((sum, r) => sum + r.total, 0);
      const salesCount = salesData
        .filter((s) => {
          const d = new Date(s.date);
          return d >= start && d <= end;
        })
        .reduce((sum, s) => sum + s.total, 0);
      return { revenue, salesCount };
    },
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-neutral-100 rounded-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-error flex items-center gap-2">
        Ошибка загрузки
        <button
          className="underline"
          onClick={() => refetch()}
        >
          Повторить
        </button>
      </div>
    );
  }
  const revenue = data.revenue;
  const salesCount = data.salesCount;
  const avgCheck = salesCount ? revenue / salesCount : 0;

  const kpis = [
    {
      label: "Выручка",
      value: currency.format(revenue),
      href: "/reports",
    },
    {
      label: "Кол-во продаж",
      value: salesCount.toLocaleString("ru-RU"),
      href: "/reports",
    },
    {
      label: "Средний чек",
      value: currency.format(avgCheck),
      href: "/reports",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {kpis.map((k) => (
        <Link
          key={k.label}
          href={k.href}
          className="bg-neutral-100 p-4 rounded-card shadow-card flex flex-col"
        >
          <span className="text-sm text-neutral-600">{k.label}</span>
          <span className="text-xl font-semibold">{k.value}</span>
        </Link>
      ))}
    </div>
  );
};

export default KpiCards;
