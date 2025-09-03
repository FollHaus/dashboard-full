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

export type Period = 'day' | 'week' | 'month' | 'year' | 'range'

export interface DashboardFilter {
  period: Period
  from?: string
  to?: string
}

interface FilterCtx {
  filter: DashboardFilter
  setFilter: (f: DashboardFilter) => void
  setPeriod: (p: Period) => void
  initFrom: () => void
}

const DashboardFilterContext = createContext<FilterCtx | null>(null)

const STORAGE_KEY = 'dashboard.filter'
const isValidPeriod = (p: any): p is Period =>
  p === 'day' || p === 'week' || p === 'month' || p === 'year' || p === 'range'

let initialized = false

export const DashboardFilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [filter, setFilterState] = useState<DashboardFilter>({ period: 'day' })

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
      setFilterState(f)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(f))
        syncUrl(f)
        queryClient.invalidateQueries({ queryKey: ['kpi'] })
        queryClient.invalidateQueries({ queryKey: ['daily-revenue'] })
        queryClient.invalidateQueries({ queryKey: ['sales'] })
        queryClient.invalidateQueries({ queryKey: ['top-products'] })
      }
    },
    [syncUrl, queryClient],
  )

  const setPeriod = useCallback((p: Period) => setFilter({ period: p }), [setFilter])

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
    let initial: DashboardFilter = { period: 'day' }
    if (isValidPeriod(urlPeriod)) {
      initial = { period: urlPeriod as Period }
      if (urlPeriod === 'range' && urlFrom && urlTo) {
        initial.from = urlFrom
        initial.to = urlTo
      }
    } else if (storageFilter && isValidPeriod(storageFilter.period)) {
      initial = storageFilter
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
            setFilterState(parsed)
            const params = new URLSearchParams(window.location.search)
            params.set('period', parsed.period)
            if (parsed.period === 'range' && parsed.from && parsed.to) {
              params.set('from', parsed.from)
              params.set('to', parsed.to)
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
      const next: DashboardFilter = { period: p as Period }
      if (p === 'range' && from && to) {
        next.from = from
        next.to = to
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

