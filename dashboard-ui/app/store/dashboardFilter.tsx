'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Period, isValidPeriod } from '@/store/period'
export type { Period } from '@/store/period'

export interface DashboardFilter {
  period: Period
  from: string | null
  to: string | null
}

export const DEFAULT_FILTER: DashboardFilter = {
  period: 'day',
  from: null,
  to: null,
}

interface FilterCtx {
  filter: DashboardFilter
  setFilter: (f: DashboardFilter) => void
  setPeriod: (p: Period) => void
  initFrom: () => void
}

const DashboardFilterContext = createContext<FilterCtx | null>(null)

const STORAGE_KEY = 'dashboard.filter'

let initialized = false

export const DashboardFilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [filter, setFilterState] = useState<DashboardFilter>(DEFAULT_FILTER)

  const syncUrl = useCallback(
    (f: DashboardFilter) => {
      const params = new URLSearchParams(window.location.search)
      params.set('period', f.period)
      if (f.period === 'range' && f.from && f.to) {
        params.set('from', f.from)
        params.set('to', f.to)
      } else {
        params.delete('from')
        params.delete('to')
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router],
  )

  const setFilter = useCallback(
    (f: DashboardFilter) => {
      const next: DashboardFilter = {
        period: f.period,
        from: f.period === 'range' ? f.from ?? null : null,
        to: f.period === 'range' ? f.to ?? null : null,
      }
      setFilterState(next)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        syncUrl(next)
        queryClient.invalidateQueries({ queryKey: ['kpi'] })
        queryClient.invalidateQueries({ queryKey: ['daily-revenue'] })
        queryClient.invalidateQueries({ queryKey: ['sales'] })
        queryClient.invalidateQueries({ queryKey: ['top-products'] })
      }
    },
    [syncUrl, queryClient],
  )

  const setPeriod = useCallback(
    (p: Period) => setFilter({ period: p, from: null, to: null }),
    [setFilter],
  )

  const initFrom = useCallback(() => {
    if (initialized || typeof window === 'undefined') return
    initialized = true
    const params = new URLSearchParams(window.location.search)
    const urlPeriod = params.get('period')
    const urlFrom = params.get('from')
    const urlTo = params.get('to')
    let storageFilter: DashboardFilter | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      storageFilter = raw ? JSON.parse(raw) : null
    } catch {
      /* empty */
    }
    let initial: DashboardFilter = { ...DEFAULT_FILTER }
    if (isValidPeriod(urlPeriod)) {
      initial = { period: urlPeriod as Period, from: null, to: null }
      if (urlPeriod === 'range' && urlFrom && urlTo) {
        initial.from = urlFrom
        initial.to = urlTo
      }
    } else if (storageFilter && isValidPeriod(storageFilter.period)) {
      initial = {
        period: storageFilter.period,
        from: storageFilter.from ?? null,
        to: storageFilter.to ?? null,
      }
      if (initial.period !== 'range') {
        initial.from = null
        initial.to = null
      }
    }
    setFilterState(initial)
    params.set('period', initial.period)
    if (initial.period === 'range' && initial.from && initial.to) {
      params.set('from', initial.from)
      params.set('to', initial.to)
    } else {
      params.delete('from')
      params.delete('to')
    }
    router.replace(`?${params.toString()}`, { scroll: false })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (isValidPeriod(parsed.period)) {
            const next: DashboardFilter = {
              period: parsed.period,
              from: parsed.period === 'range' ? parsed.from ?? null : null,
              to: parsed.period === 'range' ? parsed.to ?? null : null,
            }
            setFilterState(next)
            const params = new URLSearchParams(window.location.search)
            params.set('period', next.period)
            if (next.period === 'range' && next.from && next.to) {
              params.set('from', next.from)
              params.set('to', next.to)
            } else {
              params.delete('from')
              params.delete('to')
            }
            router.replace(`?${params.toString()}`, { scroll: false })
          }
        } catch {
          /* empty */
        }
      }
    }
    window.addEventListener('storage', handleStorage)
  }, [router])

  useEffect(() => {
    const p = searchParams.get('period')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (isValidPeriod(p)) {
      const next: DashboardFilter = {
        period: p as Period,
        from: p === 'range' ? from ?? null : null,
        to: p === 'range' ? to ?? null : null,
      }
      setFilterState(next)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      }
    }
  }, [searchParams])

  const value = { filter, setFilter, setPeriod, initFrom }
  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  )
}

export function useDashboardFilter() {
  const ctx = useContext(DashboardFilterContext)
  if (!ctx) throw new Error('useDashboardFilter must be used within DashboardFilterProvider')
  return ctx
}

