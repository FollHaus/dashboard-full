'use client'

import clsx from 'classnames'
import {
  Package,
  AlertTriangle,
  XCircle,
  Wallet,
  DollarSign,
  type LucideIcon,
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
  const topCards: {
    label: string
    icon: LucideIcon
    color: string
    value: string
    valueClass: string
    bg: string
  }[] = [
    {
      label: 'Товаров',
      icon: Package,
      color: 'text-info',
      value: numberFormatter.format(totalCount),
      valueClass: 'text-info font-semibold',
      bg: 'bg-info/20',
    },
    {
      label: 'Мало на складе',
      icon: AlertTriangle,
      color: 'text-warning',
      value: numberFormatter.format(lowStock),
      valueClass: 'text-warning font-semibold',
      bg: 'bg-warning/20',
    },
    {
      label: 'Нет в наличии',
      icon: XCircle,
      color: 'text-error',
      value: numberFormatter.format(outOfStock),
      valueClass: 'text-error font-semibold',
      bg: 'bg-error/20',
    },
  ]

  const bottomCards: {
    label: string
    icon: LucideIcon
    color: string
    value: string
    valueClass: string
    bg: string
  }[] = [
    {
      label: 'Закупочная стоимость',
      icon: Wallet,
      color: 'text-neutral-900',
      value: currencyFormatter.format(purchaseValue),
      valueClass: 'text-neutral-900',
      bg: 'bg-neutral-200',
    },
    {
      label: 'Продажная стоимость',
      icon: DollarSign,
      color: 'text-success',
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
            <div
              className={clsx(
                'w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-neutral-100',
                card.color,
              )}
            >
              <card.icon className="w-6 h-6 md:w-7 md:h-7 text-current" />
            </div>
            {isLoading ? (
              <div className="mt-2 h-7 w-20 bg-neutral-300 rounded animate-pulse" />
            ) : (
              <div
                className={clsx(
                  'mt-2 text-2xl md:text-3xl font-bold',
                  card.valueClass,
                )}
              >
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
            <div
              className={clsx(
                'w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-neutral-100',
                card.color,
              )}
            >
              <card.icon className="w-6 h-6 md:w-7 md:h-7 text-current" />
            </div>
            {isLoading ? (
              <div className="mt-2 h-7 w-20 bg-neutral-300 rounded animate-pulse" />
            ) : (
              <div
                className={clsx(
                  'mt-2 text-2xl md:text-3xl font-bold',
                  card.valueClass,
                )}
              >
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

