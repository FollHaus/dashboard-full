import { Period } from '@/store/period'

export const safePct = (value: number, total: number): number => {
  return total > 0 ? +((value / total) * 100).toFixed(1) : 0
}

export const formatTick = (dateStr: string, period: Period): string => {
  const date = new Date(dateStr)
  switch (period) {
    case 'day':
      return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    case 'year':
      return new Intl.DateTimeFormat('ru-RU', {
        month: 'short',
      }).format(date)
    default:
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'short',
      }).format(date)
  }
}
