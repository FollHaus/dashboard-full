import clsx from 'classnames'
import { ReactNode } from 'react'

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  valueTitle?: string
  valueClassName?: string
  isLoading?: boolean
  delta?: number | string
}

const KpiCard = ({
  icon,
  label,
  value,
  valueTitle,
  valueClassName,
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
      <div className={clsx('flex items-center gap-1 text-sm ml-auto', cls)}>
        {isUp && <span>▲</span>}
        {isDown && <span>▼</span>}
        <span>{formatted}%</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-neutral-100 shadow-card p-4 md:p-5 flex items-center gap-3">
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
