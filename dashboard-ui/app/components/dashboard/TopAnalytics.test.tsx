import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import TopAnalytics from './TopAnalytics'
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
        <TopAnalytics />
      </DashboardFilterProvider>
    </QueryClientProvider>,
  )
}

describe('TopAnalytics', () => {
  it('renders tabs and metric toggle', async () => {
    renderWidget()
    expect(await screen.findByText(/Топ-аналитика/)).toBeInTheDocument()
    expect(screen.getByText('По продуктам')).toBeInTheDocument()
    expect(screen.getByText('По категориям')).toBeInTheDocument()
    expect(screen.getByText('Выручка')).toBeInTheDocument()
  })
})
