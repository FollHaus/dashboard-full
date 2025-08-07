import { FC } from 'react'
import Button from '@/ui/Button/Button'
import { Product } from './product.types'

interface Props {
  product: Product
  onClose: () => void
}

const ProductDetails: FC<Props> = ({ product, onClose }) => {
  return (
    <div className="mt-4 p-4 border border-neutral-300 rounded bg-neutral-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <Button onClick={onClose} className="bg-secondary-500 text-white px-2 py-1">Close</Button>
      </div>
      <div>
        <h3 className="font-medium">Movement</h3>
        <ul className="list-disc ml-5 text-sm">
          {product.movement.map((m, idx) => (
            <li key={idx}>{m}</li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <h3 className="font-medium">Purchase / Sales History</h3>
        <ul className="list-disc ml-5 text-sm">
          {product.history.map((h, idx) => (
            <li key={idx}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ProductDetails
