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
      <ProductDetails product={mockProducts[0]} onClose={() => {}} />,
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
      .mockResolvedValue({ ...mockProducts[0], minStock: 3 })
    renderWithClient(
      <ProductDetails product={mockProducts[0]} onClose={() => {}} />,
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
      <ProductDetails product={mockProducts[0]} onClose={() => {}} />,
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
      <ProductDetails product={mockProducts[0]} onClose={() => {}} />,
      client
    )
    await screen.findByLabelText('Минимальный остаток')
    rerender(
      <QueryClientProvider client={client}>
        <ProductDetails product={mockProducts[1]} onClose={() => {}} />
      </QueryClientProvider>
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    expect(input).toHaveValue(mockProducts[1].minStock)
  })
})
