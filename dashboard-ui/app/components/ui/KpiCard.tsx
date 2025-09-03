import { ElementType, ReactNode } from 'react'
import clsx from 'classnames'

const ACCENTS: Record<string, { bg: string; text: string }> = {
  success: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-600' },
  info: { bg: 'bg-blue-100', text: 'text-blue-600' },
  error: { bg: 'bg-red-100', text: 'text-red-600' },
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
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

  const accentCls = ACCENTS[accent]

  return (
    <div
      className={clsx(
        'kpi-card relative rounded-xl shadow-card p-3 md:p-4 flex items-center gap-3 h-[92px] md:h-[100px]',
        accentCls.bg,
        className,
      )}
    >
      <div
        className={clsx(
          'kpi-icon w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-white/70',
          accentCls.text,
        )}
      >
        {iconEl}
      </div>
      <div className='flex-1 min-w-0 flex flex-col justify-center'>
        <div
          className={clsx(
            'kpi-title text-[13px] md:text-sm font-semibold leading-5 truncate',
            accentCls.text,
          )}
        >
          {title}
        </div>
        <div
          className={clsx(
            'kpi-value text-xl md:text-2xl font-bold tabular-nums whitespace-nowrap overflow-hidden text-ellipsis',
            accentCls.text,
          )}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
