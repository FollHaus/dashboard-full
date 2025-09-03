'use client'

import clsx from 'classnames'
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
      valueClass: 'text-info font-semibold',
      bg: 'bg-info/20',
    },
    {
      label: 'Мало на складе',
      icon: <Archive className="w-5 h-5 text-warning" />,
      value: numberFormatter.format(lowStock),
      valueClass: 'text-warning font-semibold',
      bg: 'bg-warning/20',
    },
    {
      label: 'Нет в наличии',
      icon: <PackageX className="w-5 h-5 text-error" />,
      value: numberFormatter.format(outOfStock),
      valueClass: 'text-error font-semibold',
      bg: 'bg-error/20',
    },
  ]

  const bottomCards = [
    {
      label: 'Закупочная стоимость',
      icon: <CircleDollarSign className="w-5 h-5 text-neutral-900" />,
      value: currencyFormatter.format(purchaseValue),
      valueClass: 'text-neutral-900',
      bg: 'bg-neutral-200',
    },
    {
      label: 'Продажная стоимость',
      icon: <DollarSign className="w-5 h-5 text-success" />,
      value: currencyFormatter.format(saleValue),
      valueClass: 'text-success font-semibold',
      bg: 'bg-success/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCards.map(card => (
          <div
            key={card.label}
            className={clsx(
              'rounded-xl shadow-card p-4 flex flex-col items-center justify-center text-center',
              card.bg,
            )}
          >
            {card.icon}
            {isLoading ? (
              <div className="mt-2 h-7 w-20 bg-neutral-300 rounded animate-pulse" />
            ) : (
              <div className={clsx('text-2xl md:text-3xl font-bold', card.valueClass)}>
                {card.value}
              </div>
            )}
            <div className="text-sm text-neutral-800">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bottomCards.map(card => (
          <div
            key={card.label}
            className={clsx(
              'rounded-xl shadow-card p-4 flex flex-col items-center justify-center text-center',
              card.bg,
            )}
          >
            {card.icon}
            {isLoading ? (
              <div className="mt-2 h-7 w-20 bg-neutral-300 rounded animate-pulse" />
            ) : (
              <div className={clsx('text-2xl md:text-3xl font-bold', card.valueClass)}>
                {card.value}
              </div>
            )}
            <div className="text-sm text-neutral-800">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

