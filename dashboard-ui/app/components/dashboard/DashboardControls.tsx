"use client";

import React from "react";
import { useDashboardFilter, Period, DEFAULT_FILTER } from "@/store/dashboardFilter";

interface Props {
  warehouse?: string;
  onWarehouseChange?: (w: string) => void;
}

const periodOptions: { value: Period; label: string }[] = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "year", label: "Год" },
];

const DashboardControls: React.FC<Props> = ({ warehouse, onWarehouseChange }) => {
  const { filter: ctxFilter, setPeriod } = useDashboardFilter();
  const { period } = ctxFilter ?? DEFAULT_FILTER;
  return (
    <div className="inline-flex items-center gap-4">
      <select
        aria-label="Выбор периода"
        className="border border-neutral-300 rounded px-2 py-1 text-sm w-auto"
        value={period}
        onChange={(e) => setPeriod(e.target.value as Period)}
      >
        {periodOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {onWarehouseChange && (
        <select
          aria-label="Склад"
          className="border border-neutral-300 rounded px-2 py-1 text-sm w-auto"
          value={warehouse ?? ""}
          onChange={(e) => onWarehouseChange(e.target.value)}
        >
          <option value="">Все склады</option>
        </select>
      )}
    </div>
  );
};

export default DashboardControls;
