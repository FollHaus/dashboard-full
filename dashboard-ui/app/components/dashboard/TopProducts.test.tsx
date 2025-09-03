import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import TopProducts from './TopProducts'
import { DashboardFilterProvider } from '@/store/dashboardFilter'

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getTopProducts: vi.fn(() => Promise.resolve([])),
    getCategorySales: vi.fn(() => Promise.resolve([])),
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
      <DashboardFilterProvider>
        <TopProducts />
      </DashboardFilterProvider>
    </QueryClientProvider>,
  )
}

describe('TopProducts', () => {
  it('renders headers and toggle', async () => {
    renderWidget()
    expect(await screen.findByText(/Топ продуктов/)).toBeInTheDocument()
    expect(await screen.findByText(/Топ категорий/)).toBeInTheDocument()
    expect(screen.getByText('Выручка')).toBeInTheDocument()
  })
})
