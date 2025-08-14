import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import TopProducts from './TopProducts'

vi.mock('@/services/analytics/analytics.service', () => ({
  AnalyticsService: {
    getTopProducts: vi.fn(() =>
      Promise.resolve([
        { productId: 1, productName: 'Test', totalUnits: 1, totalRevenue: 1000 },
      ])
    ),
  },
}))
vi.mock('@/services/product/product.service', () => ({
  ProductService: { getById: vi.fn(() => Promise.resolve({ remains: 5 })) },
}))

const renderWidget = () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <TopProducts />
    </QueryClientProvider>
  )
}

describe('TopProducts', () => {
  it('renders items', async () => {
    renderWidget()
    expect(await screen.findByText('Test')).toBeInTheDocument()
  })
})
