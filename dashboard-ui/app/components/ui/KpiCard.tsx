import clsx from 'classnames'
import { ReactNode } from 'react'

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  valueTitle?: string
  valueClassName?: string
  isLoading?: boolean
  deltaPct?: number
}

const KpiCard = ({
  icon,
  label,
  value,
  valueTitle,
  valueClassName,
  isLoading,
  deltaPct,
}: KpiCardProps) => {
  let deltaEl: ReactNode = null
  if (typeof deltaPct === 'number') {
    const formatted = Math.abs(deltaPct).toLocaleString('ru-RU', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    const sign = deltaPct > 0 ? '+' : deltaPct < 0 ? '-' : ''
    const arrow = deltaPct > 0 ? '🔺' : deltaPct < 0 ? '🔻' : ''
    const cls =
      deltaPct > 0
        ? 'text-success'
        : deltaPct < 0
          ? 'text-error'
          : 'text-neutral-800'
    const text = arrow
      ? `${arrow} ${sign}${formatted}%`
      : `${sign}${formatted}%`
    deltaEl = <div className={clsx('text-xs ml-auto', cls)}>{text}</div>
  }

  return (
    <div className="rounded-2xl bg-neutral-200 shadow-card p-4 md:p-5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-neutral-100">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-neutral-800 truncate">{label}</div>
        {isLoading ? (
          <div className="mt-1 h-7 w-20 bg-neutral-300 rounded animate-pulse" />
        ) : (
          <div
            className={clsx(
              'text-2xl md:text-3xl font-semibold tabular-nums whitespace-nowrap overflow-hidden text-ellipsis',
              valueClassName,
            )}
            title={valueTitle}
          >
            {value}
          </div>
        )}
      </div>
      {deltaEl}
    </div>
  )
}

export default KpiCard
