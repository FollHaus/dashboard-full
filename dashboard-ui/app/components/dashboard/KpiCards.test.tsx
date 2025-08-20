import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import KpiCards from './KpiCards'
import { PeriodProvider } from '@/store/period'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getKpis: vi.fn(() =>
      Promise.resolve({ revenue: 1000, orders: 2, avgCheck: 500 })
    ),
  },
}))

const renderKpis = () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <PeriodProvider>
        <KpiCards />
      </PeriodProvider>
    </QueryClientProvider>
  )
}

describe('KpiCards', () => {
  it('aggregates KPIs', async () => {
    renderKpis()
    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(await screen.findByText(/1[\s\u00A0]?000,00/)).toBeInTheDocument()
    expect(await screen.findByText(/500,00/)).toBeInTheDocument()
  })
})
