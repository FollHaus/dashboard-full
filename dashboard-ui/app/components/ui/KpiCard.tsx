import { ElementType, ReactNode } from 'react'
import clsx from 'classnames'

const ACCENTS: Record<string, string> = {
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  error: '#ef4444',
  neutral: '#c8b08d',
}

export interface KpiCardProps {
  /** Заголовок карточки */
  title: string
  /** Значение внутри карточки */
  value: ReactNode
  /** Иконка или эмодзи */
  icon: ElementType | string
  /** Цветовой акцент */
  accent?: keyof typeof ACCENTS
  /** Дополнительные классы */
  className?: string
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  accent = 'neutral',
  className,
}: KpiCardProps) {
  const iconEl = typeof Icon === 'string' ? (
    <span className='text-base md:text-lg'>{Icon}</span>
  ) : (
    <Icon className='w-5 h-5 md:w-5 md:h-5 text-current' />
  )

  return (
    <div
      className={clsx(
        'kpi-card relative rounded-xl bg-neutral-100 shadow-card p-3 md:p-4 flex items-center gap-3 h-[92px] md:h-[100px]',
        className,
      )}
      style={{ ['--kpi-accent' as any]: ACCENTS[accent] }}
    >
      <span
        className='absolute inset-x-0 top-0 h-1 rounded-t-xl bg-[var(--kpi-accent,#c8b08d)]'
        aria-hidden
      />
      <div className='kpi-icon w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0'>
        {iconEl}
      </div>
      <div className='flex-1 min-w-0 flex flex-col justify-center'>
        <div className='kpi-title text-[13px] md:text-sm font-semibold text-neutral-900 leading-5 truncate'>
          {title}
        </div>
        <div className='kpi-value text-xl md:text-2xl font-bold tabular-nums text-neutral-900 whitespace-nowrap overflow-hidden text-ellipsis'>
          {value}
        </div>
      </div>
    </div>
  )
}
