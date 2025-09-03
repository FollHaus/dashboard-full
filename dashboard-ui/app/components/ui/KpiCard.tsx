import { ReactNode, ElementType, isValidElement, cloneElement } from 'react'
import cn from 'classnames'

const ACCENTS: Record<string, { bg: string; text: string }> = {
  success: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-600' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  error: { bg: 'bg-red-100', text: 'text-red-600' },
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
}

export interface KpiCardProps {
  /** Заголовок карточки */
  title: string
  /** Значение внутри карточки */
  value: ReactNode
  /** Иконка или эмодзи */
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
  if (typeof icon === 'string') {
    iconEl = <span className='w-5 h-5 md:w-5 md:h-5 text-current'>{icon}</span>
  } else if (isValidElement(icon)) {
    iconEl = cloneElement(icon, {
      className: cn('w-5 h-5 md:w-5 md:h-5 text-current', icon.props.className),
    })
  } else {
    const IconComp = icon as ElementType
    iconEl = <IconComp className='w-5 h-5 md:w-5 md:h-5 text-current' />
  }

  return (
    <div
      className={cn(
        'rounded-xl shadow-card p-4 md:p-5 h-[120px] flex items-start gap-3',
        bg,
        text,
        className,
      )}
    >
      <div className='w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0'>
        {iconEl}
      </div>
      <div className='flex-1 min-w-0 flex flex-col justify-center items-start'>
        <div className='text-[13px] md:text-sm font-medium text-neutral-800/80 leading-5 truncate'>
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

