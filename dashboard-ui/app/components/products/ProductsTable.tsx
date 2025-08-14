'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/ui/Button/Button'
import { ProductService } from '@/services/product/product.service'
import ProductForm from './ProductForm'
import ProductDetails from './ProductDetails'
import { useInventoryList } from '@/hooks/useInventoryList'
import { IInventory } from '@/shared/interfaces/inventory.interface'
import useDebounce from '@/hooks/useDebounce'

const ProductsTable = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPage = Number(searchParams.get('page') || '1')
  const initialName = searchParams.get('searchName') || ''
  const initialSku = searchParams.get('searchSku') || ''

  const [page, setPage] = useState(initialPage)
  const [pageSize] = useState(10)
  const [searchName, setSearchName] = useState(initialName)
  const [searchSku, setSearchSku] = useState(initialSku)
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<IInventory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [products, setProducts] = useState<IInventory[]>([])
  const [error, setError] = useState<string | null>(null)

  const debouncedName = useDebounce(searchName, 300)
  const debouncedSku = useDebounce(searchSku, 300)

  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (searchName) params.set('searchName', searchName)
    if (searchSku) params.set('searchSku', searchSku)
    router.replace(`?${params.toString()}`)
  }, [page, searchName, searchSku, router])

  useEffect(() => {
    setPage(1)
  }, [debouncedName, debouncedSku])

  const { data, status, refetch } = useInventoryList({
    page,
    pageSize,
    searchName: debouncedName,
    searchSku: debouncedSku,
    sort: `${sortField}:${sortOrder}`,
  })

  useEffect(() => {
    if (status === 'success' && data) {
      setProducts(data.items)
    }
  }, [status, data])

  const handleSort = (field: 'name' | 'quantity' | 'price') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await ProductService.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleReset = () => {
    setSearchName('')
    setSearchSku('')
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="searchName" className="mb-1">Название</label>
          <input
            id="searchName"
            type="text"
            placeholder="Поиск"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="searchSku" className="mb-1">Артикул</label>
          <input
            id="searchSku"
            type="text"
            placeholder="Поиск"
            value={searchSku}
            onChange={e => setSearchSku(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          />
        </div>
        <Button
          className="bg-neutral-200 px-4 py-1"
          onClick={handleReset}
        >
          Сброс
        </Button>
        <Button
          className="ml-auto bg-primary-500 text-white px-4 py-1"
          onClick={() => setIsCreating(true)}
        >
          Добавить товар
        </Button>
      </div>

      {status === 'pending' && (
        <div className="py-10 text-center animate-pulse">
          <div className="h-4 bg-neutral-200 rounded mb-2" />
          <div className="h-4 bg-neutral-200 rounded mb-2" />
          <div className="h-4 bg-neutral-200 rounded" />
          <p className="mt-4">Загрузка...</p>
        </div>
      )}
      {status === 'error' && products.length === 0 && (
        <div className="text-center text-error py-4">
          Ошибка загрузки
          <Button
            className="ml-2 bg-primary-500 text-white px-4 py-1"
            onClick={() => refetch()}
          >
            Повторить
          </Button>
        </div>
      )}

      {(status === 'success' || products.length > 0) && (
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
                  onClick={() => handleSort('quantity')}
                >
                  Остаток {sortField === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Цена продажи {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-2 text-center">
                    Нет данных
                  </td>
                </tr>
              )}
              {products.map(prod => (
                <tr
                  key={prod.id}
                  className="border-b border-neutral-200 hover:bg-neutral-200"
                >
                  <td className="p-2">{prod.name}</td>
                  <td className="p-2">{prod.category?.name || '-'}</td>
                  <td className="p-2">{prod.code}</td>
                  <td className="p-2">{prod.quantity}</td>
                  <td className="p-2">${prod.price}</td>
                  <td className="p-2">
                    <Button
                      className="bg-error text-white px-4 py-1"
                      onClick={() => handleDelete(prod.id)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                className="px-3 py-1 bg-neutral-200"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Предыдущая
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button
                className="px-3 py-1 bg-neutral-200"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Следующая
              </Button>
            </div>
          )}

          {selected && (
            <ProductDetails product={selected} onClose={() => setSelected(null)} />
          )}
          {isCreating && (
            <div className="mt-4">
              <ProductForm
                onSuccess={() => {
                  refetch()
                  setIsCreating(false)
                }}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          )}
          {error && <p className="text-error mt-2">{error}</p>}
        </>
      )}
    </div>
  )
}

export default ProductsTable
