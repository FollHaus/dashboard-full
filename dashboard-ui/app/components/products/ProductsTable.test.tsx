import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import ProductsTable from './ProductsTable'
import { server } from '@/tests/mocks/server'
import { mockProducts } from '@/tests/mocks/handlers'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}))

beforeAll(() => {
  // Stub alert used in toast notifications to avoid jsdom errors
  window.alert = vi.fn()
  window.confirm = vi.fn(() => true)
})

const defaultProducts = [
  {
    id: 1,
    name: 'Product 1',
    articleNumber: 'A1',
    purchasePrice: 10,
    salePrice: 20,
    remains: 5,
    minStock: 5,
  },
  {
    id: 2,
    name: 'Second',
    articleNumber: 'B2',
    purchasePrice: 8,
    salePrice: 15,
    remains: 2,
    minStock: 3,
  },
]

const setProducts = (products = defaultProducts) => {
  mockProducts.splice(0, mockProducts.length, ...products.map(p => ({ ...p })))
}

const renderTable = () => {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ProductsTable isAddOpen={false} onCloseAdd={() => {}} />
    </QueryClientProvider>,
  )
}

describe('ProductsTable', () => {
  beforeEach(() => {
    setProducts()
  })

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
      await screen.findByText('Ошибка загрузки', {}, { timeout: 3000 })
    ).toBeInTheDocument()
  })

  it('handles empty data', async () => {
    server.use(
      http.get('http://localhost:4000/api/products', () => HttpResponse.json([]))
    )
    renderTable()
    expect(await screen.findByText('Товары не найдены')).toBeInTheDocument()
  })

  it('filters by name', async () => {
    renderTable()
    await screen.findByText('Product 1')
    const input = screen.getByPlaceholderText('Поиск...')
    await userEvent.type(input, 'Second')
    await waitFor(() => {
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  it('filters by sku', async () => {
    renderTable()
    await screen.findByText('Product 1')
    const input = screen.getByPlaceholderText('Поиск...')
    await userEvent.type(input, 'B2')
    await waitFor(() => {
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  it('deletes a product', async () => {
    renderTable()
    const menuBtn = (await screen.findAllByRole('button', { name: 'Действия' }))[0]
    await userEvent.click(menuBtn)
    const deleteMenuItem = await screen.findByRole('menuitem', { name: 'Удалить' })
    await userEvent.click(deleteMenuItem)
    const confirmBtn = await screen.findByRole('button', { name: 'Удалить' })
    await userEvent.click(confirmBtn)
    await waitFor(() => {
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
    })
  })

  it('edits a product', async () => {
    renderTable()
    await screen.findByText('Product 1')
    const menuBtn = (await screen.findAllByRole('button', { name: 'Действия' }))[0]
    await userEvent.click(menuBtn)
    const editMenuItem = await screen.findByRole('menuitem', { name: 'Редактировать' })
    await userEvent.click(editMenuItem)
    const articleInput = await screen.findByLabelText('Артикул')
    await userEvent.clear(articleInput)
    await userEvent.type(articleInput, 'NEW')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(screen.getByText('NEW')).toBeInTheDocument())
  })

})
