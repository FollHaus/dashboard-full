"use client";

import React from "react";
import { usePeriod, Period } from "@/store/period";

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
  const { period, set } = usePeriod();
  return (
    <div className="inline-flex items-center gap-4">
      <select
        aria-label="Выбор периода"
        className="border border-neutral-300 rounded px-2 py-1 text-sm w-auto"
        value={period}
        onChange={(e) => set(e.target.value as Period)}
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
