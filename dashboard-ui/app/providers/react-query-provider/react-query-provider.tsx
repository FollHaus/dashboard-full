'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useRef } from 'react'

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const queryClientRef = useRef<QueryClient>(null)
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    })
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  )
}
