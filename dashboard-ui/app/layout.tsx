// app/layout.tsx
import React from 'react'
import '@/assets/styles/global.scss'
import { FontProviders } from './providers/font-provider/providers'
import { Metadata } from 'next'
import AuthProvider from 'providers/auth-provider/AuthProvider'
import { ReactQueryProvider } from './providers/react-query-provider/react-query-provider'
import { FilterProvider } from './providers/filter-provider/filter-provider'
import { PeriodProvider } from '@/store/period'

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <ReactQueryProvider>
        <FilterProvider>
          <AuthProvider>
            <FontProviders>
              <PeriodProvider>
                <body>{children}</body>
              </PeriodProvider>
            </FontProviders>
          </AuthProvider>
        </FilterProvider>
      </ReactQueryProvider>
    </html>
  )
}
