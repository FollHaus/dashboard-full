import { FC, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Button from '@/ui/Button/Button'
import Modal from '@/ui/Modal/Modal'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'
import { formatCurrency } from '@/utils/formatCurrency'

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
        <div className="space-y-1 text-sm">
          <p>Закупочная цена: {formatCurrency(p.purchasePrice)}</p>
          <p>Цена продажи: {formatCurrency(p.salePrice)}</p>
          <p>Остаток: {p.remains}</p>
          <p>Минимальный остаток: {p.minStock}</p>
        </div>
        <div className="mt-4 text-right">
          <Button
            onClick={onClose}
            className="bg-secondary-500 text-white px-4 py-2"
          >
            Закрыть
          </Button>
        </div>
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

