"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { Period } from "./DashboardControls";

const daysMap: Record<Period, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

interface Props {
  period: Period;
}

const KpiCards: React.FC<Props> = ({ period }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kpi", period],
    queryFn: async () => {
      const [turnover, sales] = await Promise.all([
        AnalyticsService.getTurnover(),
        AnalyticsService.getSales(daysMap[period]),
      ]);
      const salesCount = sales.reduce((sum, s) => sum + s.total, 0);
      return { turnover, salesCount };
    },
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-neutral-100 rounded-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-error">Нет данных</div>;
  }

  const revenue = data.turnover[period] ?? 0;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
