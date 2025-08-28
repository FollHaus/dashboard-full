"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FaReceipt, FaRubleSign, FaShoppingCart } from "react-icons/fa";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { getPeriodRange } from "@/utils/buckets";
import { usePeriod } from "@/store/period";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

const KpiCards: React.FC = () => {
  const { period } = usePeriod();
  const { start, end } = getPeriodRange(period);
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["kpi", period, start.toISOString(), end.toISOString()],
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
      href: "/reports/new",
      text: "text-success",
      bg: "bg-success/20",
      Icon: FaRubleSign,
    },
    {
      label: "Кол-во продаж",
      value: salesCount.toLocaleString("ru-RU"),
      href: "/reports/new",
      text: "text-info",
      bg: "bg-info/20",
      Icon: FaShoppingCart,
    },
    {
      label: "Средний чек",
      value: currency.format(avgCheck),
      href: "/reports/new",
      text: "text-secondary-700",
      bg: "bg-secondary-300/40",
      Icon: FaReceipt,
    },
  ];

  return (
    <div className="relative">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {isLoading && !data
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-neutral-200 rounded-2xl animate-pulse"
              />
            ))
          : kpis.map(({ label, value, href, text, bg, Icon }) => (
              <Link
                key={label}
                href={href}
                className="bg-neutral-200 p-4 md:p-5 rounded-2xl shadow-card flex items-center gap-4"
              >
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} ${text}`}
                >
                  <Icon />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm text-neutral-600">{label}</span>
                  <span className={`text-2xl md:text-3xl font-semibold tabular-nums ${text}`}>{value}</span>
                </span>
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
