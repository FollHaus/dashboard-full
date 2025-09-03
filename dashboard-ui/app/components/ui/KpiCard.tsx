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
   * CSS класс для цвета текста
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
        'rounded-xl shadow-card p-4 flex flex-col items-center text-center gap-2',
        className,
        valueClassName,
      )}
    >
      {icon && (
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/70 text-current text-xl md:text-2xl">
          {icon}
        </div>
      )}
      <div className="text-sm font-medium text-neutral-800">{label}</div>
      {isLoading ? (
        <div className="h-7 w-20 bg-neutral-300 rounded animate-pulse" />
      ) : (
        <div className="text-2xl md:text-3xl font-bold tabular-nums text-current" title={valueTitle}>
          {value}
        </div>
      )}
      {deltaEl}
    </div>
  )
}

export default KpiCard
