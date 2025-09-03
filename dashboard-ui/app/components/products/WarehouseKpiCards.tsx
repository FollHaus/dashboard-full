'use client'

import KpiCard from '@/components/ui/KpiCard'
import {
  Package,
  CircleDollarSign,
  DollarSign,
  PackageX,
  Archive,
} from 'lucide-react'

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
  const topCards = [
    {
      label: 'Товаров',
      icon: <Package className="w-5 h-5 text-info" />,
      value: numberFormatter.format(totalCount),
      valueClass: 'text-info',
    },
    {
      label: 'Мало на складе',
      icon: <Archive className="w-5 h-5 text-warning" />,
      value: numberFormatter.format(lowStock),
      valueClass: 'text-warning',
    },
    {
      label: 'Нет в наличии',
      icon: <PackageX className="w-5 h-5 text-error" />,
      value: numberFormatter.format(outOfStock),
      valueClass: 'text-error',
    },
  ]

  const bottomCards = [
    {
      label: 'Закупочная стоимость',
      icon: <CircleDollarSign className="w-5 h-5 text-neutral-900" />,
      value: currencyFormatter.format(purchaseValue),
      valueClass: 'text-neutral-900',
    },
    {
      label: 'Продажная стоимость',
      icon: <DollarSign className="w-5 h-5 text-success" />,
      value: currencyFormatter.format(saleValue),
      valueClass: 'text-success',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCards.map(card => (
          <KpiCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            valueClassName={card.valueClass}
            isLoading={isLoading}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bottomCards.map(card => (
          <KpiCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            valueClassName={card.valueClass}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}

