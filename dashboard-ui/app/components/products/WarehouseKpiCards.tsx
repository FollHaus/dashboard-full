'use client'

import {
  Package,
  AlertTriangle,
  XCircle,
  Wallet,
  DollarSign,
  type LucideIcon,
} from 'lucide-react'
import KpiCard from '../ui/KpiCard'

interface WarehouseKpiCardsProps {
  totalCount: number
  lowStock: number
  outOfStock: number
  purchaseValue: number
  saleValue: number
  isLoading: boolean
}

const numberFormatter = new Intl.NumberFormat('ru-RU')
const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
})

export default function WarehouseKpiCards({
  totalCount,
  lowStock,
  outOfStock,
  purchaseValue,
  saleValue,
  isLoading,
}: WarehouseKpiCardsProps) {
  const topCards: {
    title: string
    icon: LucideIcon
    value: string
    accent: 'info' | 'warning' | 'error'
  }[] = [
    {
      title: 'Товары',
      icon: Package,
      value: numberFormatter.format(totalCount),
      accent: 'info',
    },
    {
      title: 'Мало на складе',
      icon: AlertTriangle,
      value: numberFormatter.format(lowStock),
      accent: 'warning',
    },
    {
      title: 'Нет в наличии',
      icon: XCircle,
      value: numberFormatter.format(outOfStock),
      accent: 'error',
    },
  ]

  const bottomCards: {
    title: string
    icon: LucideIcon
    value: string
    accent: 'info' | 'success'
  }[] = [
    {
      title: 'Закупочная стоимость',
      icon: Wallet,
      value: currencyFormatter.format(purchaseValue),
      accent: 'info',
    },
    {
      title: 'Продажная стоимость',
      icon: DollarSign,
      value: currencyFormatter.format(saleValue),
      accent: 'success',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {topCards.map(card => (
          isLoading ? (
            <div
              key={card.title}
              className="rounded-xl bg-neutral-100 shadow-card h-[92px] md:h-[100px] animate-pulse"
            />
          ) : (
            <KpiCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              accent={card.accent}
            />
          )
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {bottomCards.map(card => (
          isLoading ? (
            <div
              key={card.title}
              className="rounded-xl bg-neutral-100 shadow-card h-[92px] md:h-[100px] animate-pulse"
            />
          ) : (
            <KpiCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              accent={card.accent}
            />
          )
        ))}
      </div>
    </div>
  )
}

