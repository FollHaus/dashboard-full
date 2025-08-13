'use client';
import { useEffect, useState, useRef, useCallback } from 'react'
import Button from '@/ui/Button/Button'
import ProductDetails from './ProductDetails'
import ProductForm from './ProductForm'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'
import { useFilter } from '@/providers/filter-provider/filter-provider'

const ProductsTable = () => {
  const [products, setProducts] = useState<IProduct[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState('')
  const [searchMode, setSearchMode] = useState<'name' | 'category'>('name')
  const [selected, setSelected] = useState<IProduct | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<'name' | 'remains' | 'salePrice'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const abortRef = useRef<AbortController | null>(null)
  const { notifyFiltersChanged, subscribe } = useFilter()
  const firstSearch = useRef(true)
  const firstFilters = useRef(true)

  useEffect(() => {
    const unsub = subscribe(() => {
      abortRef.current?.abort()
    })
    return unsub
  }, [subscribe])

  const fetchProducts = useCallback(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setIsLoading(true)
    setError(null)
    ProductService.getAll(controller.signal)
      .then(data => {
        if (abortRef.current === controller) setProducts(data)
      })
      .catch(e => {
        if (e.name === 'CanceledError' || e.name === 'AbortError') return
        console.error(e)
        if (abortRef.current === controller) setError('Не удалось загрузить товары')
      })
      .finally(() => {
        if (abortRef.current === controller) setIsLoading(false)
      })
  }, [])

  // Загружаем список продуктов при монтировании
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Если загрузка завершилась ошибкой, пытаемся повторить
  // автоматически: разово через небольшой интервал и
  // при восстановлении соединения
  useEffect(() => {
    if (!error) return

    const retry = () => fetchProducts()
    const timer = setTimeout(retry, 5000)
    window.addEventListener('online', retry)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', retry)
    }
  }, [error, fetchProducts])

  // Обновляем значение поиска с задержкой
  useEffect(() => {
    if (firstSearch.current) {
      firstSearch.current = false
      return
    }
    const handler = setTimeout(() => {
      setSearch(searchTerm)
      notifyFiltersChanged()
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm, notifyFiltersChanged])

  useEffect(() => {
    if (firstFilters.current) {
      firstFilters.current = false
      return
    }
    notifyFiltersChanged()
  }, [searchMode, sortField, sortOrder, notifyFiltersChanged])

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
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    ProductService.getById(id, controller.signal)
      .then(setSelected)
      .catch(e => {
        if (e.name !== 'CanceledError') setError(e.message)
      })
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

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center text-error py-4">
          {error}
          <Button
            className="ml-2 bg-primary-500 text-white px-4 py-1"
            onClick={fetchProducts}
          >
            Обновить
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <>
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
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-2 text-center">
                    Nothing found
                  </td>
                </tr>
              )}
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

          {selected && (
            <ProductDetails
              product={selected}
              onClose={() => setSelected(null)}
            />
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
        </>
      )}
    </div>
  )
}

export default ProductsTable
