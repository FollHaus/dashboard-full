"use client"

import { useDashboardFilter, DEFAULT_FILTER } from './dashboardFilter'

export type Period = 'day' | 'week' | 'month' | 'year' | 'range'

export const isValidPeriod = (p: unknown): p is Period =>
  p === 'day' || p === 'week' || p === 'month' || p === 'year' || p === 'range'

export const usePeriod = () => {
  const { filter } = useDashboardFilter()
  return filter?.period ?? DEFAULT_FILTER.period
}
