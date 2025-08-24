"use client";

import React from "react";
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

  const profit = data?.margin ?? 0;
  const profitText = currency.format(profit);
  const color = profit >= 0 ? "text-success" : "text-error";

  return (
    <div className="bg-neutral-200 p-4 md:p-5 rounded-2xl shadow-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        💼 Финансовый итог
      </h3>
      <div className="text-2xl md:text-3xl font-semibold tabular-nums">
        <span className={color}>{profitText}</span>
      </div>
      <div className="text-sm text-neutral-600">Прибыль за период</div>
    </div>
  );
};

export default FinancialSummary;
