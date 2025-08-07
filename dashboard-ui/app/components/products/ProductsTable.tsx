import { useEffect, useState } from 'react'
import Button from '@/ui/Button/Button'
import ProductDetails from './ProductDetails'
import ProductForm from './ProductForm'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'

const ProductsTable = () => {
  const [products, setProducts] = useState<IProduct[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<IProduct | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загружаем список продуктов при монтировании
  useEffect(() => {
    ProductService.getAll()
      .then(setProducts)
      .catch(e => setError(e.message))
  }, [])

  const categories = Array.from(
    new Set(products.map(p => p.category?.name || ''))
  )

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!category || p.category?.name === category)
  )

  const isLow = (balance: number) => balance <= 5

  const selectProduct = (id: number) => {
    ProductService.getById(id)
      .then(setSelected)
      .catch(e => setError(e.message))
  }

  const handleDelete = async (id: number) => {
    try {
      await ProductService.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error deleting product')
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search products"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          >
            <option value="">All categories</option>
            {categories
              .filter(Boolean)
              .map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <Button
            className="bg-primary-500 text-white px-4 py-1"
            onClick={() => setIsCreating(true)}
          >
            Add product
          </Button>
          <Button className="bg-primary-500 text-white px-4 py-1">Import/Export list</Button>
        </div>
      </div>

      <table className="min-w-full bg-neutral-100 rounded shadow-md">
        <thead>
          <tr className="text-left border-b border-neutral-300">
            <th className="p-2">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Balance</th>
            <th className="p-2">Price</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(prod => (
            <tr
              key={prod.id}
              onClick={() => selectProduct(prod.id)}
              className={`cursor-pointer border-b border-neutral-200 hover:bg-neutral-200 ${isLow(prod.remains) ? 'bg-warning/20' : ''}`}
            >
              <td className="p-2">{prod.name}</td>
              <td className="p-2">{prod.category?.name || '-'}</td>
              <td className="p-2">
                {prod.remains}
                {isLow(prod.remains) && (
                  <span className="text-error ml-1">(!)</span>
                )}
              </td>
              <td className="p-2">${prod.salePrice}</td>
              <td className="p-2">
                <Button
                  className="bg-error text-white px-4 py-1"
                  onClick={e => {
                    e.stopPropagation()
                    handleDelete(prod.id)
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <p className="text-error mt-2">{error}</p>}
      {selected && (
        <ProductDetails product={selected} onClose={() => setSelected(null)} />
      )}
      {isCreating && (
        <div className="mt-4">
          <ProductForm
            onSuccess={() => {
              ProductService.getAll()
                .then(setProducts)
                .catch(e => setError(e.message))
              setIsCreating(false)
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
    </div>
  )
}

export default ProductsTable
