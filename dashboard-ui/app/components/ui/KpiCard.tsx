import clsx from 'classnames'
import { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: ReactNode
  valueTitle?: string
  valueClassName?: string
  className?: string
  isLoading?: boolean
  delta?: number | string
}

const KpiCard = ({
  label,
  value,
  valueTitle,
  valueClassName,
  className,
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
        'rounded-xl p-4 md:p-5 shadow-card text-center flex flex-col items-center justify-center gap-1',
        'bg-neutral-100',
        className,
      )}
    >
      <div className="text-sm text-neutral-800 truncate">{label}</div>
      {isLoading ? (
        <div className="mt-1 h-7 w-20 bg-neutral-300 rounded animate-pulse" />
      ) : (
        <div
          className={clsx(
            'text-2xl md:text-3xl font-bold tabular-nums whitespace-nowrap overflow-hidden text-ellipsis',
            valueClassName,
          )}
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
