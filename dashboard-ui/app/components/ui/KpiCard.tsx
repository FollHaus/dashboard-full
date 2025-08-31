import clsx from 'classnames'
import { ReactNode } from 'react'

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  valueClassName?: string
  isLoading?: boolean
}

const KpiCard = ({ icon, label, value, valueClassName, isLoading }: KpiCardProps) => {
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
          >
            {value}
          </div>
        )}
      </div>
    </div>
  )
}

export default KpiCard
