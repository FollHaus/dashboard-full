import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductsTable from './ProductsTable'
import { server } from '@/tests/mocks/server'

const renderTable = () => {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ProductsTable />
    </QueryClientProvider>
  )
}

describe('ProductsTable', () => {
  it('renders products from API (happy path)', async () => {
    renderTable()
    expect(await screen.findByText('Product 1')).toBeInTheDocument()
  })

  it('shows error on API failure', async () => {
    server.use(
      http.get('http://localhost:4000/api/products', () => HttpResponse.error())
    )
    renderTable()
    expect(
      await screen.findByText(/error/i, {}, { timeout: 3000 })
    ).toBeInTheDocument()
  })

  it('handles empty data', async () => {
    server.use(
      http.get('http://localhost:4000/api/products', () => HttpResponse.json([]))
    )
    renderTable()
    expect(
      await screen.findByText('Nothing found')
    ).toBeInTheDocument()
  })

  it('filters by name', async () => {
    renderTable()
    await screen.findByText('Product 1')
    const input = screen.getByPlaceholderText('Search by name...')
    await userEvent.type(input, 'Second')
    await waitFor(() => {
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  it('deletes a product', async () => {
    renderTable()
    const deleteBtn = (await screen.findAllByRole('button', { name: /удалить/i }))[0]
    await userEvent.click(deleteBtn)
    await waitFor(() => {
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
    })
  })
})
