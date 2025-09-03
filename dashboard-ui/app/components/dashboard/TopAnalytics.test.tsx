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
  it('renders filter panel with controls', async () => {
    renderWidget()
    expect(await screen.findByText(/Топ-аналитика/)).toBeInTheDocument()
    expect(await screen.findByText(/Топ-5 товаров/)).toBeInTheDocument()
    expect(await screen.findByText(/Нет данных за период/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Выручка' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Количество' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'По товарам' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'По категориям' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '15' })).toBeInTheDocument()
  })
})
