import { ReactNode, ElementType, isValidElement, cloneElement } from 'react'
import cn from 'classnames'

const ACCENTS: Record<string, { bg: string; text: string }> = {
  success: { bg: 'bg-success/20', text: 'text-success' },
  warning: { bg: 'bg-warning/20', text: 'text-warning' },
  info: { bg: 'bg-info/20', text: 'text-info' },
  error: { bg: 'bg-error/20', text: 'text-error' },
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  primary: { bg: 'bg-primary-100', text: 'text-primary-500' },
}

export interface KpiCardProps {
  /** Заголовок карточки */
  title: string
  /** Значение внутри карточки */
  value: ReactNode
  /** Иконка lucide */
  icon: ReactNode | ElementType
  /** Цвет фона карточки */
  accentBg?: string
  /** Цвет текста карточки */
  accentText?: string
  /** Изменение в процентах (0-1) */
  deltaPct?: number
  /** Предустановленный акцент (для обратной совместимости) */
  accent?: keyof typeof ACCENTS
  /** Дополнительные классы */
  className?: string
}

export default function KpiCard({
  title,
  value,
  icon,
  accentBg,
  accentText,
  deltaPct,
  accent = 'neutral',
  className,
}: KpiCardProps) {
  const accentCls = ACCENTS[accent] || { bg: '', text: '' }
  const bg = accentBg || accentCls.bg || 'bg-neutral-100'
  const text = accentText || accentCls.text || 'text-neutral-600'

  let iconEl: ReactNode
  if (isValidElement(icon)) {
    iconEl = cloneElement(icon, {
      className: cn('w-5 h-5 md:w-5 md:h-5 text-current', icon.props.className),
    })
  } else if (typeof icon === 'string') {
    iconEl = <span className='w-5 h-5 md:w-5 md:h-5 text-current'>{icon}</span>
  } else {
    const IconComp = icon as ElementType
    iconEl = <IconComp className='w-5 h-5 md:w-5 md:h-5 text-current' />
  }

  return (
    <div
      className={cn(
        'rounded-xl shadow-card hover:shadow-card-hover h-[100px] flex items-start gap-3 p-3 md:p-4 pb-2 md:pb-3',
        bg,
        text,
        className,
      )}
    >
      <div className='w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0'>
        {iconEl}
      </div>
      <div className='flex-1 min-w-0 flex flex-col justify-center items-start'>
        <div className='text-[13px] md:text-sm font-medium text-neutral-900/80 leading-5 truncate'>
          {title}
        </div>
        <div className='text-2xl md:text-3xl font-bold tabular-nums text-current truncate'>
          {value}
        </div>
        {typeof deltaPct === 'number' && !Number.isNaN(deltaPct) && (
          <div
            className={cn(
              'text-xs mt-0.5',
              deltaPct > 0
                ? 'text-success'
                : deltaPct < 0
                  ? 'text-error'
                  : 'text-neutral-800',
            )}
          >
            {deltaPct > 0 ? '▲' : deltaPct < 0 ? '▼' : ''}{' '}
            {Math.abs(deltaPct * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}

