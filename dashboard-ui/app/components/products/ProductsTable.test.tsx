import { render, screen, waitFor, within } from '@testing-library/react'
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
      <ProductsTable />
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
    expect(await screen.findByText('Нет данных')).toBeInTheDocument()
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
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'sku')
    const input = screen.getByPlaceholderText('Поиск...')
    await userEvent.type(input, 'B2')
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

  it('edits product and updates stats', async () => {
    renderTable()
    await screen.findByText('Product 1')
    const lowBlock = screen.getByText('Мало на складе').parentElement
    expect(lowBlock?.querySelector('div.text-xl')?.textContent).toBe('2')

    const editBtn = (await screen.findAllByTitle('Редактировать'))[0]
    await userEvent.click(editBtn)
    const nameInput = await screen.findByLabelText('Название товара')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Новый')
    const minStockInput = screen.getByLabelText('Минимальный остаток')
    await userEvent.clear(minStockInput)
    await userEvent.type(minStockInput, '3')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => expect(screen.getByText('Новый')).toBeInTheDocument())
    expect(lowBlock?.querySelector('div.text-xl')?.textContent).toBe('1')
  })

  it('marks product low when minStock increases', async () => {
    setProducts([
      {
        id: 1,
        name: 'Product 1',
        articleNumber: 'A1',
        purchasePrice: 10,
        salePrice: 20,
        remains: 5,
        minStock: 2,
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
    ])
    renderTable()
    await screen.findByText('Product 1')
    const lowBlock = screen.getByText('Мало на складе').parentElement
    expect(lowBlock?.querySelector('div.text-xl')?.textContent).toBe('1')

    const row = screen.getByText('Product 1').closest('tr')!
    expect(within(row).queryByText('Мало')).toBeNull()

    const editBtn = within(row).getByTitle('Редактировать')
    await userEvent.click(editBtn)
    const minStockInput = await screen.findByLabelText('Минимальный остаток')
    await userEvent.clear(minStockInput)
    await userEvent.type(minStockInput, '6')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      const updatedRow = screen.getByText('Product 1').closest('tr')!
      expect(within(updatedRow).getByText('Мало')).toBeInTheDocument()
    })
    expect(lowBlock?.querySelector('div.text-xl')?.textContent).toBe('2')
  })

  it('removes low flag when minStock decreases', async () => {
    setProducts([
      {
        id: 1,
        name: 'Product 1',
        articleNumber: 'A1',
        purchasePrice: 10,
        salePrice: 20,
        remains: 5,
        minStock: 6,
      },
      {
        id: 2,
        name: 'Second',
        articleNumber: 'B2',
        purchasePrice: 8,
        salePrice: 15,
        remains: 2,
        minStock: 1,
      },
    ])
    renderTable()
    await screen.findByText('Product 1')
    const lowBlock = screen.getByText('Мало на складе').parentElement
    expect(lowBlock?.querySelector('div.text-xl')?.textContent).toBe('1')
    const row = screen.getByText('Product 1').closest('tr')!
    expect(within(row).getByText('Мало')).toBeInTheDocument()

    const editBtn = within(row).getByTitle('Редактировать')
    await userEvent.click(editBtn)
    const minStockInput = await screen.findByLabelText('Минимальный остаток')
    await userEvent.clear(minStockInput)
    await userEvent.type(minStockInput, '2')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      const updatedRow = screen.getByText('Product 1').closest('tr')!
      expect(within(updatedRow).queryByText('Мало')).toBeNull()
    })
    expect(lowBlock?.querySelector('div.text-xl')?.textContent).toBe('0')
  })

  it('updates list with active low filter', async () => {
    setProducts([
      {
        id: 1,
        name: 'Product 1',
        articleNumber: 'A1',
        purchasePrice: 10,
        salePrice: 20,
        remains: 5,
        minStock: 6,
      },
      {
        id: 2,
        name: 'Second',
        articleNumber: 'B2',
        purchasePrice: 8,
        salePrice: 15,
        remains: 2,
        minStock: 1,
      },
    ])
    renderTable()
    await screen.findByText('Product 1')
    const lowBlock = screen.getByText('Мало на складе').parentElement!
    await userEvent.click(lowBlock)
    await waitFor(() => {
      expect(screen.queryByText('Second')).not.toBeInTheDocument()
    })

    const row = screen.getByText('Product 1').closest('tr')!
    const editBtn = within(row).getByTitle('Редактировать')
    await userEvent.click(editBtn)
    const minStockInput = await screen.findByLabelText('Минимальный остаток')
    await userEvent.clear(minStockInput)
    await userEvent.type(minStockInput, '2')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
    })
    expect(lowBlock.querySelector('div.text-xl')?.textContent).toBe('0')
  })
})
