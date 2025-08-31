'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface TaskFilters {
  from: string
  to: string
  priority: string
  status: string
  search: string
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function getDefaultRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 6)
  return { from: formatDate(from), to: formatDate(to) }
}

const STORAGE_KEY = 'tasks.filters'

export function useTaskFilters() {
  const router = useRouter()
  const [filters, setFiltersState] = useState<TaskFilters>(() => {
    const range = getDefaultRange()
    return { ...range, priority: '', status: '', search: '' }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? (JSON.parse(stored) as Partial<TaskFilters>) : {}
    const range = getDefaultRange()
    const from = params.get('from') || parsed.from || range.from
    const to = params.get('to') || parsed.to || range.to
    const priority = params.get('priority') || parsed.priority || ''
    const status = params.get('status') || parsed.status || ''
    const search = params.get('q') || parsed.search || ''
    const init = { from, to, priority, status, search }
    setFiltersState(init)
    const p = new URLSearchParams()
    p.set('from', from)
    p.set('to', to)
    if (priority) p.set('priority', priority)
    if (status) p.set('status', status)
    if (search) p.set('q', search)
    router.replace(`?${p.toString()}`, { scroll: false })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(init))
  }, [router])

  const setFilters = useCallback(
    (changes: Partial<TaskFilters>) => {
      setFiltersState(prev => {
        const next = { ...prev, ...changes }
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams()
          params.set('from', next.from)
          params.set('to', next.to)
          if (next.priority) params.set('priority', next.priority)
          if (next.status) params.set('status', next.status)
          if (next.search) params.set('q', next.search)
          router.replace(`?${params.toString()}`, { scroll: false })
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        }
        return next
      })
    },
    [router],
  )

  return { filters, setFilters }
}

export default useTaskFilters

