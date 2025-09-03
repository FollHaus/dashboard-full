import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import KpiCards from './KpiCards'
import { DashboardFilterProvider } from '@/store/dashboardFilter'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const getKpisMock = vi.fn()
;(getKpisMock as any)
  .mockResolvedValueOnce({ revenue: 1000, orders: 2, avgCheck: 500, cogs: 600 })
  .mockResolvedValueOnce({ revenue: 800, orders: 1, avgCheck: 800, cogs: 600 })

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getKpis: (...args: any[]) => getKpisMock(...args),
  },
}))

const renderKpis = () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <DashboardFilterProvider>
        <KpiCards />
      </DashboardFilterProvider>
    </QueryClientProvider>,
  )
}

describe('KpiCards', () => {
  it('renders KPI groups', async () => {
    renderKpis()
    expect(await screen.findByText('Выручка')).toBeInTheDocument()
    expect(screen.getByText('Кол-во продаж')).toBeInTheDocument()
    expect(screen.getByText('📦 Операционные KPI')).toBeInTheDocument()
  })
})
