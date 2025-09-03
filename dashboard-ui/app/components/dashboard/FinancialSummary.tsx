"use client";

import React from "react";
import { FaBriefcase } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { getPeriodRange } from "@/utils/buckets";
import { usePeriod } from "@/store/period";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

const FinancialSummary: React.FC = () => {
  const { period } = usePeriod();
  const { start, end } = getPeriodRange(period);
  const { data } = useQuery({
    queryKey: ["kpi", period, start.toISOString(), end.toISOString()],
    queryFn: async () =>
      AnalyticsService.getKpis(
        start.toISOString().slice(0, 10),
        end.toISOString().slice(0, 10)
      ),
    keepPreviousData: true,
  });

  const revenue = data?.revenue ?? 0;
  const purchaseCost = revenue - (data?.margin ?? 0);
  const profit = revenue - purchaseCost;
  const profitText = currency.format(profit);
  const color =
    profit > 0
      ? "text-success"
      : profit < 0
        ? "text-error"
        : "text-neutral-900";

  return (
    <div className="rounded-xl shadow-card p-4 md:p-5 bg-neutral-100 flex items-center gap-3">
      <span className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-300 text-neutral-900">
        <FaBriefcase />
      </span>
      <span className="flex flex-col">
        <span className="text-sm text-neutral-600">Финансовый итог</span>
        <span className={`text-2xl md:text-3xl font-semibold tabular-nums ${color}`}>
          {profitText}
        </span>
      </span>
    </div>
  );
};

export default FinancialSummary;
