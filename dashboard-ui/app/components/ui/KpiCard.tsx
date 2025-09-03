import clsx from 'classnames'
import { ReactNode } from 'react'

interface KpiCardProps {
  /**
   * Заголовок карточки
   */
  label: string
  /**
   * Значение, отображаемое в карточке
   */
  value: ReactNode
  /**
   * Подсказка для значения
   */
  valueTitle?: string
  /**
   * CSS класс для значения
   */
  valueClassName?: string
  /**
   * CSS класс для контейнера карточки
   */
  className?: string
  /**
   * Иконка, отображаемая сверху
   */
  icon?: ReactNode
  /**
   * Индикатор загрузки
   */
  isLoading?: boolean
  /**
   * Дельта в процентах
   */
  delta?: number | string
}

const KpiCard = ({
  label,
  value,
  valueTitle,
  valueClassName,
  className,
  icon,
  isLoading,
  delta,
}: KpiCardProps) => {
  let deltaEl: ReactNode = null
  const d = Number(delta)
  if (!Number.isNaN(d)) {
    const isUp = d > 0
    const isDown = d < 0
    const cls = isUp ? 'text-success' : isDown ? 'text-error' : 'text-neutral-800'
    const formatted = (Math.abs(d) * 100).toLocaleString('ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    deltaEl = (
      <div className={clsx('flex items-center gap-1 text-sm', cls)}>
        {isUp && <span>▲</span>}
        {isDown && <span>▼</span>}
        <span>{formatted}%</span>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'rounded-xl shadow-card p-4 md:p-5 flex flex-col items-center justify-center text-center gap-2',
        className,
      )}
    >
      {icon && <div className="text-3xl">{icon}</div>}
      <div className="text-sm font-medium text-neutral-800 truncate">{label}</div>
      {isLoading ? (
        <div className="h-7 w-20 bg-neutral-300 rounded animate-pulse" />
      ) : (
        <div
          className={clsx('text-2xl font-bold tabular-nums', valueClassName)}
          title={valueTitle}
        >
          {value}
        </div>
      )}
      {deltaEl}
    </div>
  )
}

export default KpiCard
