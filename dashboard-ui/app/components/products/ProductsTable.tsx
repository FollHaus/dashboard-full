'use client';
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
  const [sortField, setSortField] = useState<'name' | 'remains' | 'salePrice'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

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

  const sorted = [...filtered].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

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
      setError(e instanceof Error ? e.message : 'Ошибка удаления товара')
    }
  }

  const handleSort = (field: 'name' | 'remains' | 'salePrice') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Поиск товаров"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          >
            <option value="">Все категории</option>
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
            Добавить товар
          </Button>
          <Button className="bg-primary-500 text-white px-4 py-1">Импорт/экспорт списка</Button>
        </div>
      </div>

      <table className="min-w-full bg-neutral-100 rounded shadow-md">
        <thead>
          <tr className="text-left border-b border-neutral-300">
            <th
              className="p-2 cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Название {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2">Категория</th>
            <th className="p-2">Артикул</th>
            <th
              className="p-2 cursor-pointer"
              onClick={() => handleSort('remains')}
            >
              Остаток {sortField === 'remains' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="p-2 cursor-pointer"
              onClick={() => handleSort('salePrice')}
            >
              Цена продажи {sortField === 'salePrice' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(prod => (
            <tr
              key={prod.id}
              onClick={() => selectProduct(prod.id)}
              className={`cursor-pointer border-b border-neutral-200 hover:bg-neutral-200 ${isLow(prod.remains) ? 'bg-warning/20' : ''}`}
            >
              <td className="p-2">{prod.name}</td>
              <td className="p-2">{prod.category?.name || '-'}</td>
              <td className="p-2">{prod.articleNumber}</td>
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
                  Удалить
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
