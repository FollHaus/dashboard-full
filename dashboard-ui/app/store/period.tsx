'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export type Period = 'day' | 'week' | 'month' | 'year'

interface PeriodCtx {
  period: Period
  get: () => Period
  set: (p: Period) => void
  initFrom: () => void
}

const PeriodContext = createContext<PeriodCtx | null>(null)

const STORAGE_KEY = 'dashboard.period'
const isValid = (p: any): p is Period =>
  p === 'day' || p === 'week' || p === 'month' || p === 'year'

let initialized = false

export const PeriodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [period, setPeriod] = useState<Period>('day')

  const syncUrl = useCallback(
    (p: Period) => {
      const params = new URLSearchParams(window.location.search)
      params.set('period', p)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router],
  )

  const get = useCallback(() => period, [period])

  const set = useCallback(
    (p: Period) => {
      setPeriod(p)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, p)
        syncUrl(p)
      }
    },
    [syncUrl],
  )

  const initFrom = useCallback(() => {
    if (initialized || typeof window === 'undefined') return
    initialized = true
    const params = new URLSearchParams(window.location.search)
    const urlPeriod = params.get('period')
    const storagePeriod = localStorage.getItem(STORAGE_KEY)
    const initial = isValid(urlPeriod)
      ? urlPeriod
      : isValid(storagePeriod)
        ? storagePeriod
        : 'day'
    setPeriod(initial)
    params.set('period', initial)
    router.replace(`?${params.toString()}`, { scroll: false })
    localStorage.setItem(STORAGE_KEY, initial)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && isValid(e.newValue)) {
        setPeriod(e.newValue as Period)
        const params = new URLSearchParams(window.location.search)
        params.set('period', e.newValue)
        router.replace(`?${params.toString()}`, { scroll: false })
      }
    }
    window.addEventListener('storage', handleStorage)
  }, [router])

  useEffect(() => {
    const p = searchParams.get('period')
    if (isValid(p) && p !== period) {
      setPeriod(p as Period)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, p)
      }
    }
  }, [searchParams, period])

  const value = { period, get, set, initFrom }
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

export function usePeriod() {
  const ctx = useContext(PeriodContext)
  if (!ctx) throw new Error('usePeriod must be used within PeriodProvider')
  return ctx
}

