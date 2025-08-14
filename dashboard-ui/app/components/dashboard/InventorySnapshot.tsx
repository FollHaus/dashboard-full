"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductService } from "@/services/product/product.service";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

const InventorySnapshot: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inventory-snapshot"],
    queryFn: () => ProductService.getAll(),
    keepPreviousData: true,
  });

  if (isLoading) {
    return <div className="h-24 bg-neutral-100 rounded-card animate-pulse" />;
  }

  if (error || !data) {
    return (
      <div className="bg-neutral-100 p-4 rounded-card shadow-card">
        <div className="text-error mb-2">Не удалось загрузить данные</div>
        <button
          className="text-sm text-primary-600 underline"
          onClick={() => refetch()}
        >
          Повторить
        </button>
      </div>
    );
  }

  const totalSkus = data.length;
  const stockValue = data.reduce(
    (sum, p) => sum + Number(p.salePrice) * p.remains,
    0
  );
  const outOfStock = data.filter((p) => p.remains === 0).length;
  const lowStock = data.filter((p) => p.remains > 0 && p.remains < 5).length;

  const counters = [
    { label: "Всего SKU", value: totalSkus.toLocaleString("ru-RU") },
    { label: "Стоимость", value: currency.format(stockValue) },
    { label: "Нет в наличии", value: outOfStock.toLocaleString("ru-RU") },
    { label: "Мало на складе", value: lowStock.toLocaleString("ru-RU") },
  ];

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      {counters.map((c) => (
        <div key={c.label} className="flex flex-col">
          <span className="text-sm text-neutral-600">{c.label}</span>
          <span className="text-lg font-semibold">{c.value}</span>
        </div>
      ))}
    </div>
  );
};

export default InventorySnapshot;
