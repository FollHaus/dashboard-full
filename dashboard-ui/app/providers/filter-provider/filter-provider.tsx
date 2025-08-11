'use client'

import { ReactNode, createContext, useContext, useRef, useCallback } from 'react'
import { QueryKey, useQueryClient } from '@tanstack/react-query'

// Listener invoked on filter changes
 type Listener = () => void

interface FilterContextValue {
  /**
   * Notify that filters affecting given query keys were changed.
   * Any in-flight queries for these keys will be cancelled and
   * subscribers will be notified to abort their requests.
   */
  notifyFiltersChanged: (...keys: QueryKey[]) => void
  /**
   * Subscribe to filter change notifications.
   * Returns an unsubscribe function.
   */
  subscribe: (listener: Listener) => () => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const listenersRef = useRef<Set<Listener>>(new Set())

  const notifyFiltersChanged = useCallback(
    (...keys: QueryKey[]) => {
      keys.forEach(key => queryClient.cancelQueries({ queryKey: key }))
      listenersRef.current.forEach(listener => listener())
    },
    [queryClient]
  )

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  return (
    <FilterContext.Provider value={{ notifyFiltersChanged, subscribe }}>
      {children}
    </FilterContext.Provider>
  )
}

export const useFilter = () => {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilter must be used within FilterProvider')
  return ctx
}

