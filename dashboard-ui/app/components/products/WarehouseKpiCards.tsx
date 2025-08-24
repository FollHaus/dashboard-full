'use client'

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
      icon: '📦',
      value: numberFormatter.format(totalCount),
      circle: 'bg-info/10 text-info',
      valueClass: 'text-info',
    },
    {
      label: 'Закупочная стоимость',
      icon: '💰',
      value: currencyFormatter.format(purchaseValue),
      circle: 'bg-primary-300 text-neutral-900',
      valueClass: 'text-neutral-900',
    },
    {
      label: 'Продажная стоимость',
      icon: '💵',
      value: currencyFormatter.format(saleValue),
      circle: 'bg-success/10 text-success',
      valueClass: 'text-success',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      {cards.map(card => (
        <div
          key={card.label}
          role="region"
          aria-label={card.label}
          className="rounded-2xl shadow-card p-4 md:p-5 flex items-center gap-3 bg-neutral-200"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${card.circle}`}
          >
            <span aria-hidden="true">{card.icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-neutral-800">{card.label}</span>
            {isLoading ? (
              <div className="mt-1 h-7 w-20 bg-neutral-300 rounded animate-pulse" />
            ) : (
              <span
                className={`text-2xl md:text-3xl font-semibold tabular-nums ${card.valueClass}`}
              >
                {card.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

