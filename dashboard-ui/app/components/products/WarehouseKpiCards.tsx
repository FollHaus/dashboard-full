'use client'

import KpiCard from '@/components/ui/KpiCard'
import { Package, CircleDollarSign, DollarSign } from 'lucide-react'

interface WarehouseKpiCardsProps {
  totalCount: number
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
  purchaseValue,
  saleValue,
  isLoading,
}: WarehouseKpiCardsProps) {
  const cards = [
    {
      label: 'Товаров',
      icon: <Package className="w-5 h-5 text-info" />, 
      value: numberFormatter.format(totalCount),
      valueClass: 'text-info',
    },
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      {cards.map(card => (
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
  )
}

