'use client'

import { useEffect, useState } from 'react'
import Layout from '@/ui/Layout'
import type { Metadata } from 'next'
import { AnalyticsService } from '@/services/analytics/analytics.service'
import { ITopProduct } from '@/shared/interfaces/top-product.interface'

export const metadata: Metadata = {
  title: 'Статистика продаж товаров',
}

export default function ProductSalesPage() {
  const [items, setItems] = useState<ITopProduct[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    AnalyticsService.getTopProducts()
      .then(setItems)
      .catch(e => setError(e.message))
  }, [])

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Статистика продаж товаров</h2>
        {error && <div className="text-error">{error}</div>}
        <table className="min-w-full bg-neutral-100 rounded shadow-md text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Товар</th>
              <th className="p-2">Категория</th>
              <th className="p-2">Продано</th>
              <th className="p-2">Выручка</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.productId} className="border-t border-neutral-200">
                <td className="p-2">{item.productName}</td>
                <td className="p-2">{item.categoryName}</td>
                <td className="p-2">{item.totalUnits}</td>
                <td className="p-2">{item.totalRevenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
