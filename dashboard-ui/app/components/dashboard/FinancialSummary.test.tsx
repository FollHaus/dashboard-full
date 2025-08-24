import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, afterEach } from 'vitest'
import FinancialSummary from './FinancialSummary'
import { PeriodProvider } from '@/store/period'
import { AnalyticsService } from '@/services/analytics/analytics.service'

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getKpis: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const renderWidget = () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <PeriodProvider>
        <FinancialSummary />
      </PeriodProvider>
    </QueryClientProvider>
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('FinancialSummary', () => {
  it('shows positive profit in green', async () => {
    ;(AnalyticsService.getKpis as unknown as any).mockResolvedValueOnce({
      revenue: 1000,
      margin: 700,
    })
    renderWidget()
    const value = await screen.findByText(/700,00/)
    expect(value).toHaveClass('text-success')
  })

  it('shows negative profit in red', async () => {
    ;(AnalyticsService.getKpis as unknown as any).mockResolvedValueOnce({
      revenue: 1000,
      margin: -200,
    })
    renderWidget()
    const value = await screen.findByText(/-200,00/)
    expect(value).toHaveClass('text-error')
  })
})
