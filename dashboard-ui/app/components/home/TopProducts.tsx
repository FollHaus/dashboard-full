'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnalyticsService } from '@/services/analytics/analytics.service'
import { ITopProduct } from '@/shared/interfaces/top-product.interface'

const TopProducts = () => {
  const [items, setItems] = useState<ITopProduct[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    AnalyticsService.getTopProducts(10)
      .then(setItems)
      .catch(e => setError(e.message))
  }, [])

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Топ товаров</h3>
        <Link href="/products/sales" className="text-sm text-primary-600">
          Показать полностью
        </Link>
      </div>
      {error && <div className="text-error text-sm mb-2">{error}</div>}
      <ul className="divide-y divide-neutral-200">
        {items.map(item => (
          <li key={item.productId} className="py-2 flex justify-between text-sm">
            <span>
              {item.productName} ({item.categoryName})
            </span>
            <span>{item.totalUnits}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TopProducts
