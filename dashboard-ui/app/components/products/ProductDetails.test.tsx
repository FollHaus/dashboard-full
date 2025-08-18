import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import ProductDetails, { validateMinStock } from './ProductDetails'
import { mockProducts } from '@/tests/mocks/handlers'
import { calculateInventoryStats } from '@/utils/inventoryStats'

const renderWithClient = (ui: React.ReactNode, client: QueryClient) =>
  render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)

describe('ProductDetails minStock', () => {
  beforeEach(() => {
    // @ts-ignore
    window.alert = vi.fn()
  })

  it('validateMinStock works correctly', () => {
    expect(validateMinStock('-1')).toBe('Введите целое число ≥ 0')
    expect(validateMinStock('abc')).toBe('Введите целое число ≥ 0')
    expect(validateMinStock('2.5')).toBe('Введите целое число ≥ 0')
    expect(validateMinStock('0')).toBeNull()
    expect(validateMinStock('100000')).toBeNull()
  })

  it('activates low stock after saving', async () => {
    mockProducts[0].minStock = 3
    mockProducts[1].minStock = 0
    const client = new QueryClient()
    const items = mockProducts.map(p => ({
      id: p.id,
      name: p.name,
      code: p.articleNumber,
      quantity: p.remains,
      price: p.salePrice,
      purchasePrice: p.purchasePrice,
      minStock: p.minStock,
    }))
    client.setQueryData(['inventory', {}], {
      items,
      total: items.length,
      page: 1,
      pageSize: 10,
      stats: calculateInventoryStats(items),
    })
    client.setQueryData(['warehouse'], [...mockProducts])
    renderWithClient(
      <ProductDetails product={mockProducts[1]} onClose={() => {}} />,
      client
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    await waitFor(() => expect(input).toHaveValue(0))
    fireEvent.change(input, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => {
      const inv = client.getQueriesData({ queryKey: ['inventory'] })[0][1]
      expect(inv.stats.lowStock).toBe(1)
    })
  })

  it('removes low stock after saving', async () => {
    mockProducts[0].minStock = 5
    mockProducts[1].minStock = 3
    const client = new QueryClient()
    const items = mockProducts.map(p => ({
      id: p.id,
      name: p.name,
      code: p.articleNumber,
      quantity: p.remains,
      price: p.salePrice,
      purchasePrice: p.purchasePrice,
      minStock: p.minStock,
    }))
    client.setQueryData(['inventory', {}], {
      items,
      total: items.length,
      page: 1,
      pageSize: 10,
      stats: calculateInventoryStats(items),
    })
    client.setQueryData(['warehouse'], [...mockProducts])
    renderWithClient(
      <ProductDetails product={mockProducts[0]} onClose={() => {}} />,
      client
    )
    const input = await screen.findByLabelText('Минимальный остаток')
    await waitFor(() => expect(input).toHaveValue(5))
    fireEvent.change(input, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => {
      const inv = client.getQueriesData({ queryKey: ['inventory'] })[0][1]
      expect(inv.stats.lowStock).toBe(1)
    })
  })
})
