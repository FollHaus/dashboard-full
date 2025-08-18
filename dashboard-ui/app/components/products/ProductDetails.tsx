import { FC, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Button from '@/ui/Button/Button'
import Modal from '@/ui/Modal/Modal'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  calculateInventoryStats,
  DEFAULT_LOW_STOCK,
} from '@/utils/inventoryStats'

export const validateMinStock = (val: string): string | null => {
  if (val === '') return null
  if (!/^\d+$/.test(val)) return 'Введите целое число ≥ 0'
  const num = Number(val)
  if (num < 0 || num > 100000) return 'Введите целое число ≥ 0'
  return null
}

interface Props {
  product: IProduct
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  onFirst?: () => void
  onLast?: () => void
}

const ProductDetails: FC<Props> = ({
  product,
  onClose,
  onPrev,
  onNext,
  onFirst,
  onLast,
}) => {
  const hasPrev = !!onPrev
  const hasNext = !!onNext
  const titleId = `product-modal-${product.id}`

  const { data, status, refetch } = useQuery<IProduct, Error>({
    queryKey: ['product', product.id],
    queryFn: ({ signal }) => ProductService.getById(product.id, signal),
  })

  const [minStock, setMinStock] = useState<string>(
    product.minStock !== undefined ? String(product.minStock) : '',
  )
  const [inputError, setInputError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (data?.minStock !== undefined) setMinStock(String(data.minStock))
  }, [data?.minStock])

  const validate = (val: string): string | null => validateMinStock(val)

  const mutation = useMutation({
    mutationFn: (value: number) => ProductService.update(product.id, { minStock: value }),
    onMutate: async newMin => {
      setSaveError(null)
      const prevMin = data?.minStock ?? product.minStock ?? 0
      queryClient.setQueryData<IProduct>(['product', product.id], old =>
        old ? { ...old, minStock: newMin } : old,
      )
      queryClient.setQueriesData(['inventory'], old => {
        if (!old) return old
        const items = old.items.map((it: any) =>
          it.id === product.id ? { ...it, minStock: newMin } : it,
        )
        return {
          ...old,
          items,
          stats: calculateInventoryStats(items, DEFAULT_LOW_STOCK),
        }
      })
      queryClient.setQueryData<IProduct[]>(['warehouse'], old =>
        old?.map(p => (p.id === product.id ? { ...p, minStock: newMin } : p)),
      )
      return { prevMin }
    },
    onError: (_err, _newMin, context) => {
      const prev = context?.prevMin ?? 0
      queryClient.setQueryData<IProduct>(['product', product.id], old =>
        old ? { ...old, minStock: prev } : old,
      )
      queryClient.setQueriesData(['inventory'], old => {
        if (!old) return old
        const items = old.items.map((it: any) =>
          it.id === product.id ? { ...it, minStock: prev } : it,
        )
        return {
          ...old,
          items,
          stats: calculateInventoryStats(items, DEFAULT_LOW_STOCK),
        }
      })
      queryClient.setQueryData<IProduct[]>(['warehouse'], old =>
        old?.map(p => (p.id === product.id ? { ...p, minStock: prev } : p)),
      )
      setSaveError('Ошибка сохранения')
    },
    onSuccess: () => {
      alert('Сохранено')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse'] })
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMinStock(val)
    setInputError(validate(val))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate(minStock)
    if (err) {
      setInputError(err)
      return
    }
    const valueNum = minStock === '' ? 0 : Number(minStock)
    mutation.mutate(valueNum)
  }

  const handleRetry = () => {
    const err = validate(minStock)
    if (err) {
      setInputError(err)
      return
    }
    const valueNum = minStock === '' ? 0 : Number(minStock)
    mutation.mutate(valueNum)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev?.()
      if (e.key === 'ArrowRight' && hasNext) onNext?.()
      if (e.key === 'Home') onFirst?.()
      if (e.key === 'End') onLast?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [hasPrev, hasNext, onPrev, onNext, onFirst, onLast])

  let content: React.ReactNode
  if (status === 'pending') {
    content = (
      <div className="space-y-4">
        <div className="h-6 bg-neutral-200 rounded w-1/2" />
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-5/6" />
          <div className="h-4 bg-neutral-200 rounded w-2/3" />
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
          <div className="h-4 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
    )
  } else if (status === 'error') {
    content = (
      <div className="text-center">
        <p className="mb-4">Ошибка загрузки</p>
        <Button
          onClick={() => refetch()}
          className="bg-primary-500 text-white px-4 py-2"
        >
          Повторить
        </Button>
      </div>
    )
  } else {
    const p = data ?? product
    content = (
      <>
        <div className="flex items-center justify-between mb-4">
          {hasPrev && (
            <Button
              onClick={onPrev}
              className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400"
              aria-label="Предыдущий товар"
              title="Предыдущий товар"
            >
              <FaChevronLeft />
            </Button>
          )}
          <div className="flex-1 text-center">
            <h2 id={titleId} className="text-xl font-semibold">
              {p.name} <span className="text-neutral-500 text-sm">{p.articleNumber}</span>
            </h2>
            <p className="text-sm text-neutral-500">
              {p.category?.name || '-'}
            </p>
          </div>
          {hasNext && (
            <Button
              onClick={onNext}
              className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400"
              aria-label="Следующий товар"
              title="Следующий товар"
            >
              <FaChevronRight />
            </Button>
          )}
        </div>
        <div className="space-y-1 text-sm mb-4">
          <p>Закупочная цена: {formatCurrency(p.purchasePrice)}</p>
          <p>Цена продажи: {formatCurrency(p.salePrice)}</p>
          <p>Остаток: {p.remains}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <h3 className="font-medium mb-2">Настройки товара</h3>
          <label htmlFor="minStock" className="block text-sm mb-1">
            Минимальный остаток
          </label>
          <input
            id="minStock"
            type="number"
            inputMode="numeric"
            className={`w-full border rounded px-2 py-1 appearance-none ${
              inputError ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="Например, 3"
            value={minStock}
            onChange={handleChange}
            min={0}
            max={100000}
          />
          {inputError && (
            <p className="text-error text-xs mt-1">{inputError}</p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            При остатке ≤ этого значения товар попадёт в раздел ‘Мало на складе’.
          </p>
          {saveError && (
            <div className="text-error text-sm mt-2 flex items-center space-x-2">
              <span>{saveError}</span>
              <Button
                type="button"
                className="bg-primary-500 text-white px-2 py-1"
                onClick={handleRetry}
              >
                Повторить
              </Button>
            </div>
          )}
          <div className="mt-4 text-right space-x-2">
            <Button
              type="submit"
              className="bg-primary-500 text-white px-4 py-2 disabled:opacity-50"
              disabled={mutation.isPending || !!inputError}
            >
              {mutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-secondary-500 text-white px-4 py-2 disabled:opacity-50"
              disabled={mutation.isPending}
            >
              Отмена
            </Button>
          </div>
        </form>
      </>
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      ariaLabelledby={titleId}
      className="max-w-full md:max-w-4xl w-full rounded-2xl bg-white shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
    >
      {content}
    </Modal>
  )
}

export default ProductDetails

