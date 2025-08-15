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
  const { start, end } = getPeriodRange(period);
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["kpi", start.toISOString(), end.toISOString()],
    queryFn: async () =>
      AnalyticsService.getKpis(
        start.toISOString().slice(0, 10),
        end.toISOString().slice(0, 10)
      ),
    keepPreviousData: true,
  });

  if (error) {
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
  const revenue = data?.revenue ?? 0;
  const salesCount = data?.orders ?? 0;
  const avgCheck = data?.avgCheck ?? (salesCount ? revenue / salesCount : 0);

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
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading && !data
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-neutral-100 rounded-card animate-pulse"
              />
            ))
          : kpis.map((k) => (
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
      {isFetching && data && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default KpiCards;
