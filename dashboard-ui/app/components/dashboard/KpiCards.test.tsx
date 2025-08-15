import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import KpiCards from './KpiCards'

const today = new Date().toISOString().slice(0, 10)

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getDailyRevenue: vi.fn(() =>
      Promise.resolve([{ date: today, total: 1000 }])
    ),
    getSales: vi.fn(() => Promise.resolve([{ date: today, total: 2 }])),
  },
}))

const renderKpis = () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <KpiCards period="day" />
    </QueryClientProvider>
  )
}

describe('KpiCards', () => {
  it('aggregates KPIs', async () => {
    renderKpis()
    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(await screen.findByText(/500,00/)).toBeInTheDocument()
  })
})
