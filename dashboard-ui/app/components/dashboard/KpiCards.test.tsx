import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import KpiCards from './KpiCards'

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getTurnover: vi.fn(() =>
      Promise.resolve({ day: 1000, week: 0, month: 0, year: 0, allTime: 0 })
    ),
    getSales: vi.fn(() => Promise.resolve([{ total: 2 }, { total: 3 }])),
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
    expect(await screen.findByText('5')).toBeInTheDocument()
    expect(await screen.findByText(/200,00/)).toBeInTheDocument()
  })
})
