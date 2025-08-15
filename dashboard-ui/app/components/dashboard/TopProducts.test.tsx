import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import TopProducts from './TopProducts'

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getTopProducts: vi.fn(() =>
      Promise.resolve([
        { productId: 1, productName: 'Prod1', categoryName: 'Cat1', totalUnits: 10, totalRevenue: 1000 },
      ])
    ),
    getCategorySales: vi.fn(() =>
      Promise.resolve([
        { categoryId: 1, categoryName: 'Cat1', totalUnits: 10, totalRevenue: 1000 },
      ])
    ),
  },
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const renderWidget = () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <TopProducts period="day" />
    </QueryClientProvider>
  )
}

describe('TopProducts charts', () => {
  it('renders headings', async () => {
    renderWidget()
    expect(await screen.findByText('Топ товаров')).toBeInTheDocument()
    expect(screen.getByText('Товары')).toBeInTheDocument()
    expect(screen.getByText('Категории')).toBeInTheDocument()
  })
})
