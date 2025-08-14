"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { ProductService } from "@/services/product/product.service";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

interface Item {
  productId: number;
  productName: string;
  totalUnits: number;
  totalRevenue: number;
  remains: number;
}

const TopProducts: React.FC = () => {
  const { data, isLoading, error } = useQuery<Item[]>({
    queryKey: ["top-products"],
    queryFn: async () => {
      const items = await AnalyticsService.getTopProducts(5);
      const detailed = await Promise.all(
        items.map(async (it) => {
          const p = await ProductService.getById(it.productId);
          return { ...it, remains: p.remains };
        })
      );
      return detailed;
    },
  });

  if (isLoading) {
    return <div className="h-40 bg-neutral-100 rounded-card animate-pulse" />;
  }

  if (error || !data) {
    return <div className="text-error">Нет данных</div>;
  }

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Топ товаров</h3>
        <Link href="/products/sales" className="text-sm text-primary-600">
          Показать все
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-600">
            <th className="py-1">Название</th>
            <th className="py-1">Продажи</th>
            <th className="py-1">Шт.</th>
            <th className="py-1">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.productId} className="border-t border-neutral-200">
              <td className="py-1">{p.productName}</td>
              <td className="py-1">{currency.format(p.totalRevenue)}</td>
              <td className="py-1">{p.totalUnits}</td>
              <td className="py-1">{p.remains}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopProducts;
