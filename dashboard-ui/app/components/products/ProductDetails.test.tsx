import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import ProductDetails from './ProductDetails'
import { mockProducts } from '@/tests/mocks/handlers'
import { ProductService } from '@/services/product/product.service'
import { toast } from '@/utils/toast'

const renderWithClient = (ui: React.ReactNode, client: QueryClient) =>
  render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)

describe('ProductDetails minStock', () => {
  beforeEach(() => {
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    vi.spyOn(toast, 'error').mockImplementation(() => {})
  })

  it('handles allowed and disallowed input values', async () => {
    const client = new QueryClient()
    renderWithClient(
      <ProductDetails product={{ ...mockProducts[0] }} onClose={() => {}} />,
      client
    )
    const input = await screen.findByLabelText('Минимальный остаток')

    fireEvent.change(input, { target: { value: '' } })
    expect(input).toHaveValue(null)

    fireEvent.change(input, { target: { value: '0' } })
    expect(input).toHaveValue(0)

    fireEvent.change(input, { target: { value: '3' } })
    expect(input).toHaveValue(3)

    fireEvent.change(input, { target: { value: '100000' } })
    expect(input).toHaveValue(100000)

    fireEvent.change(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: '-1' } })
    expect(input).toHaveValue(null)

    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input).toHaveValue(null)

    fireEvent.change(input, { target: { value: '2.5' } })
    expect(input).toHaveValue(2)
  })

  it('submits valid number', async () => {
    const client = new QueryClient()
    const updateSpy = vi
      .spyOn(ProductService, 'update')
      .mockImplementation(async () => {
        mockProducts[0].minStock = 3
        return { ...mockProducts[0] }
      })
    renderWithClient(
      <ProductDetails product={{ ...mockProducts[0] }} onClose={() => {}} />,
      client
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    fireEvent.change(input, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(updateSpy).toHaveBeenCalledTimes(1))
    expect(toast.success).toHaveBeenCalledWith('Сохранено')
    expect(input).toHaveValue(3)
  })

  it('shows error on invalid submit', async () => {
    const client = new QueryClient()
    const updateSpy = vi.spyOn(ProductService, 'update')
    renderWithClient(
      <ProductDetails product={{ ...mockProducts[0] }} onClose={() => {}} />,
      client
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    fireEvent.change(input, { target: { value: '-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(await screen.findByText('Введите целое число ≥ 0')).toBeInTheDocument()
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('syncs value when product changes', async () => {
    const client = new QueryClient()
    const { rerender } = renderWithClient(
      <ProductDetails product={{ ...mockProducts[0] }} onClose={() => {}} />,
      client
    )
    await screen.findByLabelText('Минимальный остаток')
    rerender(
      <QueryClientProvider client={client}>
        <ProductDetails product={{ ...mockProducts[1] }} onClose={() => {}} />
      </QueryClientProvider>
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    expect(input).toHaveValue(mockProducts[1].minStock)
  })

  it('updates list and KPI counters optimistically', async () => {
    const client = new QueryClient()
    client.setQueryData(['products', { page: 1 }], {
      items: [
        {
          id: 1,
          name: 'Product 1',
          code: 'A1',
          quantity: 5,
          price: 20,
          purchasePrice: 10,
          minStock: 5,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      stats: { outOfStock: 0, lowStock: 1 },
    })
    client.setQueryData(['inventory-snapshot'], { outOfStock: 0, lowStock: 1 })
    vi.spyOn(ProductService, 'update').mockImplementation(async () => {
      mockProducts[0].minStock = 3
      return { ...mockProducts[0] }
    })

    renderWithClient(
      <ProductDetails product={{ ...mockProducts[0] }} onClose={() => {}} />,
      client,
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    fireEvent.change(input, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(ProductService.update).toHaveBeenCalled())

    expect(client.getQueryData(['product', 1])).toMatchObject({
      minStock: 3,
    })
    expect(client.getQueryData(['products', { page: 1 }])).toMatchObject({
      items: [expect.objectContaining({ minStock: 3 })],
      stats: { outOfStock: 0, lowStock: 0 },
    })
    await waitFor(() =>
      expect(client.getQueryData(['products', { page: 1 }])).toMatchObject({
        items: [expect.objectContaining({ minStock: 3 })],
        stats: { outOfStock: 0, lowStock: 0 },
      }),
    )
  })

  it('removes product from low filter when threshold decreases', async () => {
    const client = new QueryClient()
    client.setQueryData(
      ['products', { page: 1, filters: { stock: 'low' } }],
      {
        items: [
          {
            id: 2,
            name: 'Second',
            code: 'B2',
            quantity: 2,
            price: 15,
            purchasePrice: 8,
            minStock: 3,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        stats: { outOfStock: 0, lowStock: 1 },
      },
    )
    client.setQueryData(['inventory-snapshot'], { outOfStock: 0, lowStock: 1 })
    vi.spyOn(ProductService, 'update').mockImplementation(async () => {
      mockProducts[1].minStock = 1
      return { ...mockProducts[1] }
    })

    renderWithClient(
      <ProductDetails product={{ ...mockProducts[1] }} onClose={() => {}} />,
      client,
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(ProductService.update).toHaveBeenCalled())

    expect(
      client.getQueryData(['products', { page: 1, filters: { stock: 'low' } }]),
    ).toMatchObject({
      items: [],
      total: 0,
      stats: { lowStock: 0 },
    })
    expect(client.getQueryData(['inventory-snapshot'])).toMatchObject({
      lowStock: 0,
    })
  })
})
