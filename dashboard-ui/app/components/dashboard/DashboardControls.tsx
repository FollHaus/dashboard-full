"use client";

import React from "react";

interface Props {
  period: Period;
  onPeriodChange: (p: Period) => void;
  warehouse?: string;
  onWarehouseChange?: (w: string) => void;
}

export type Period = "day" | "week" | "month" | "year";

const periodOptions: { value: Period; label: string }[] = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "year", label: "Год" },
];

const DashboardControls: React.FC<Props> = ({
  period,
  onPeriodChange,
  warehouse,
  onWarehouseChange,
}) => {
  return (
    <div className="flex items-center gap-4">
      <select
        aria-label="Выбор периода"
        className="border border-neutral-300 rounded px-2 py-1 text-sm w-auto"
        value={period}
        onChange={(e) => onPeriodChange(e.target.value as Period)}
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
          className="border border-neutral-300 rounded px-2 py-1 text-sm ml-auto w-auto"
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
