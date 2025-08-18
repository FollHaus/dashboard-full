import { FC, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Button from '@/ui/Button/Button'
import Modal from '@/ui/Modal/Modal'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'
import { formatCurrency } from '@/utils/formatCurrency'
import { toast } from '@/utils/toast'
import Field from '@/ui/Field/Field'
import { isLowStock } from '@/utils/inventoryStats'
import { InventoryList } from '@/shared/interfaces/inventory.interface'

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

  const [minStock, setMinStock] = useState<number | ''>(
    product.minStock ?? '',
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasInvalid, setHasInvalid] = useState(false)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (data?.minStock !== undefined) setMinStock(data.minStock)
  }, [data?.minStock])

  useEffect(() => {
    setMinStock(product.minStock ?? '')
  }, [product.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (v === '') {
      setMinStock('')
      setHasInvalid(false)
      return
    }
    const n = Number(v)
    if (Number.isNaN(n) || n < 0 || !Number.isFinite(n)) {
      setHasInvalid(true)
      return
    }
    setHasInvalid(false)
    setMinStock(Math.floor(n))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = minStock === '' ? 0 : Number(minStock)
    if (hasInvalid || !Number.isInteger(n) || n < 0) {
      setError('Введите целое число ≥ 0')
      return
    }
    setError(null)
    setIsSaving(true)
    try {
      await ProductService.update(product.id, { minStock: n })

      const wasLow =
        product.remains > 0 &&
        isLowStock(product.remains, product.minStock)
      const isLow = product.remains > 0 && isLowStock(product.remains, n)
      const deltaLow = (isLow ? 1 : 0) - (wasLow ? 1 : 0)

      // update individual product cache
      queryClient.setQueryData(['product', product.id], (old: any) =>
        old ? { ...old, minStock: n, isLow } : old,
      )

      // update products lists
      const lists = queryClient.getQueriesData<InventoryList>({
        queryKey: ['products'],
      })
      lists.forEach(([key, old]) => {
        if (!old) return
        const index = old.items.findIndex(it => it.id === product.id)
        if (index === -1) return
        const filter = (key[1] as any)?.filters?.stock
        const item = old.items[index]
        const wasLowItem =
          item.quantity > 0 && isLowStock(item.quantity, item.minStock)
        const updated = { ...item, minStock: n }
        const isLowItem = item.quantity > 0 && isLowStock(item.quantity, n)
        let items = [...old.items]
        let total = old.total
        let lowStock = old.stats.lowStock
        items[index] = updated
        if (filter === 'low' && !isLowItem) {
          items.splice(index, 1)
          total -= 1
        }
        if (wasLowItem !== isLowItem) {
          lowStock += isLowItem ? 1 : -1
        }
        queryClient.setQueryData(key, {
          ...old,
          items,
          total,
          stats: { ...old.stats, lowStock },
        })
      })

      // update snapshot
      queryClient.setQueryData(
        ['inventory-snapshot'],
        (old: any) =>
          old
            ? { ...old, lowStock: (old.lowStock ?? 0) + deltaLow }
            : old,
      )

      toast.success('Сохранено')

      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-snapshot'] })
      queryClient.invalidateQueries({ queryKey: ['product', product.id] })
    } catch (err) {
      toast.error('Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
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
          <Field
            id="minStock"
            label="Минимальный остаток"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={minStock}
            onChange={handleChange}
            onWheel={e => (e.currentTarget as HTMLInputElement).blur()}
            disabled={isSaving}
            error={error ? ({ message: error } as any) : undefined}
          />
          <p className="mt-1 text-xs text-gray-500">
            Товар считается «мало», если Остаток ≤ Минимальный остаток.
          </p>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              type="submit"
              className="bg-primary-500 text-white px-4 py-2 disabled:opacity-50 flex items-center justify-center"
              disabled={isSaving || !!error}
            >
              {isSaving && (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Сохранить
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-secondary-500 text-white px-4 py-2 disabled:opacity-50"
              disabled={isSaving}
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

