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
    label: string
    icon: LucideIcon
    value: string
    className: string
  }[] = [
    {
      label: 'Товары',
      icon: Package,
      value: numberFormatter.format(totalCount),
      className: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Мало на складе',
      icon: AlertTriangle,
      value: numberFormatter.format(lowStock),
      className: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Нет в наличии',
      icon: XCircle,
      value: numberFormatter.format(outOfStock),
      className: 'bg-red-100 text-red-600',
    },
  ]

  const bottomCards: {
    label: string
    icon: LucideIcon
    value: string
    className: string
  }[] = [
    {
      label: 'Закупочная стоимость',
      icon: Wallet,
      value: currencyFormatter.format(purchaseValue),
      className: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Продажная стоимость',
      icon: DollarSign,
      value: currencyFormatter.format(saleValue),
      className: 'bg-green-100 text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCards.map(card => (
          <KpiCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={<card.icon className="w-6 h-6 md:w-7 md:h-7" />}
            className={card.className}
            isLoading={isLoading}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bottomCards.map(card => (
          <KpiCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={<card.icon className="w-6 h-6 md:w-7 md:h-7" />}
            className={card.className}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}

