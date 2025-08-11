'use client';
import { useEffect, useState } from 'react'
import Button from '@/ui/Button/Button'
import ProductDetails from './ProductDetails'
import ProductForm from './ProductForm'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'

const ProductsTable = () => {
  const [products, setProducts] = useState<IProduct[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState('')
  const [searchMode, setSearchMode] = useState<'name' | 'category'>('name')
  const [selected, setSelected] = useState<IProduct | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<'name' | 'remains' | 'salePrice'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const fetchProducts = () => {
    setIsLoading(true)
    setError(null)
    ProductService.getAll()
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false))
  }

  // Загружаем список продуктов при монтировании
  useEffect(() => {
    fetchProducts()
  }, [])

  // Обновляем значение поиска с задержкой
  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchTerm), 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const filtered = products.filter(p => {
    const term = search.toLowerCase()
    if (!term) return true
    if (searchMode === 'name') return p.name.toLowerCase().includes(term)
    return p.category?.name?.toLowerCase().includes(term)
  })

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
          <select
            value={searchMode}
            onChange={e => setSearchMode(e.target.value as 'name' | 'category')}
            className="border border-neutral-300 rounded px-2 py-1"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
          </select>
          <input
            type="text"
            placeholder={
              searchMode === 'name'
                ? 'Search by name...'
                : 'Search by category...'
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          />
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
          {isLoading &&
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse border-b border-neutral-200">
                {Array.from({ length: 6 }).map((__, i) => (
                  <td key={i} className="p-2">
                    <div className="h-4 bg-neutral-300 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          {!isLoading && error && (
            <tr>
              <td colSpan={6} className="p-2 text-center text-error">
                {error}
                <Button
                  className="ml-2 bg-primary-500 text-white px-4 py-1"
                  onClick={fetchProducts}
                >
                  Repeat
                </Button>
              </td>
            </tr>
          )}
          {!isLoading && !error && sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="p-2 text-center">
                Nothing found
              </td>
            </tr>
          )}
          {!isLoading && !error &&
            sorted.map(prod => (
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
      {selected && (
        <ProductDetails product={selected} onClose={() => setSelected(null)} />
      )}
      {isCreating && (
        <div className="mt-4">
          <ProductForm
            onSuccess={() => {
              fetchProducts()
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
