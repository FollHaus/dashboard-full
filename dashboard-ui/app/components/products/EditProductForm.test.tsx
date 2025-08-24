import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import EditProductForm from './EditProductForm'
import { ProductService } from '@/services/product/product.service'

const renderForm = (overrides: any = {}) => {
  const queryClient = new QueryClient()
  const product = {
    id: 1,
    name: 'Товар',
    article: 'A1',
    minStock: 1,
    purchasePrice: 1,
    salePrice: 2,
    remains: 1,
    ...overrides,
  }
  const onSuccess = vi.fn()
  render(
    <QueryClientProvider client={queryClient}>
      <EditProductForm product={product} onSuccess={onSuccess} onCancel={() => {}} />
    </QueryClientProvider>,
  )
  return { onSuccess }
}

describe('EditProductForm validation', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })
  it('validates name field', async () => {
    vi.spyOn(ProductService, 'update').mockResolvedValue({})
    const { onSuccess } = renderForm()
    const nameInput = screen.getByLabelText('Название товара')
    await userEvent.clear(nameInput)
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(await screen.findByText('Введите от 2 до 150 символов')).toBeInTheDocument()

    await userEvent.type(nameInput, 'Мотоблок')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('validates article field', async () => {
    vi.spyOn(ProductService, 'update').mockResolvedValue({})
    renderForm()
    const input = screen.getByLabelText('Артикул')
    await userEvent.clear(input)
    await userEvent.type(input, 'a!')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(
      await screen.findByText('Введите корректный артикул'),
    ).toBeInTheDocument()
    await userEvent.clear(input)
    await userEvent.type(input, 'AB-1')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() =>
      expect(ProductService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ articleNumber: 'AB-1' }),
      ),
    )
  })

  it('validates minStock integer', async () => {
    vi.spyOn(ProductService, 'update').mockResolvedValue({})
    renderForm()
    const input = screen.getByLabelText('Минимальный остаток')
    await userEvent.clear(input)
    await userEvent.type(input, '-1')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(await screen.findByText('Введите целое число не меньше 0')).toBeInTheDocument()

    await userEvent.clear(input)
    await userEvent.type(input, '3')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() =>
      expect(ProductService.update).toHaveBeenCalledWith(1, expect.objectContaining({ minStock: 3 })),
    )
  })

  it('normalizes price with comma', async () => {
    vi.spyOn(ProductService, 'update').mockResolvedValue({})
    renderForm()
    const input = screen.getByLabelText('Закупочная цена')
    await userEvent.clear(input)
    await userEvent.type(input, '12,34')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() =>
      expect(ProductService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ purchasePrice: 12.34 }),
      ),
    )
  })

  it('maps server validation errors', async () => {
    vi.spyOn(ProductService, 'update').mockRejectedValue({
      response: {
        data: {
          message: [
            { property: 'purchasePrice', constraints: { min: 'err' } },
          ],
        },
      },
    })
    renderForm()
    await userEvent.type(screen.getByLabelText('Название товара'), '1')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(
      await screen.findByText('Введите число не меньше 0'),
    ).toBeInTheDocument()
  })
})

