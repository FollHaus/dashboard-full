import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import TopProducts from './TopProducts'
import { PeriodProvider } from '@/store/period'

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getTopProducts: vi.fn(() =>
      Promise.resolve([
        { productId: 1, productName: 'Prod1', totalUnits: 10, totalRevenue: 1000, purchaseCostPortion: 400 },
      ]),
    ),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const renderWidget = () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <PeriodProvider>
        <TopProducts />
      </PeriodProvider>
    </QueryClientProvider>,
  )
}

describe('TopProducts', () => {
  it('renders header and select', async () => {
    renderWidget()
    expect(await screen.findByText(/Топ товаров/)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
