import { FC } from 'react'
import Button from '@/ui/Button/Button'
import { IProduct } from '@/shared/interfaces/product.interface'

interface Props {
  product: IProduct
  onClose: () => void
}

const ProductDetails: FC<Props> = ({ product, onClose }) => {
  return (
    <div className="mt-4 p-4 border border-neutral-300 rounded bg-neutral-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <Button
          onClick={onClose}
          className="bg-secondary-500 text-white px-2 py-1"
        >
          Закрыть
        </Button>
      </div>
      <div className="space-y-1 text-sm">
        <p>Артикул: {product.articleNumber}</p>
        <p>Категория: {product.category?.name || '-'}</p>
        <p>Закупочная цена: ${product.purchasePrice}</p>
        <p>Цена продажи: ${product.salePrice}</p>
        <p>Остаток: {product.remains}</p>
      </div>
    </div>
  )
}

export default ProductDetails
