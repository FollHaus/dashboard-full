'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/ui/Button/Button'
import { ProductService } from '@/services/product/product.service'
import ProductForm from './ProductForm'
import ProductDetails from './ProductDetails'
import Modal from '@/ui/Modal/Modal'
import { useInventoryList } from '@/hooks/useInventoryList'
import { IInventory } from '@/shared/interfaces/inventory.interface'
import useDebounce from '@/hooks/useDebounce'
import { formatCurrency } from '@/utils/formatCurrency'
import './ProductsTable.css'

const ProductsTable = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPage = Number(searchParams.get('page') || '1')
  const initialName = searchParams.get('searchName') || ''
  const initialSku = searchParams.get('searchSku') || ''
  const initialField: 'name' | 'sku' = initialSku ? 'sku' : 'name'
  const initialTerm = initialField === 'sku' ? initialSku : initialName

  const [page, setPage] = useState(initialPage)
  const [pageSize] = useState(10)
  const ROW_HEIGHT = 44
  const [searchTerm, setSearchTerm] = useState(initialTerm)
  const [searchField, setSearchField] = useState<'name' | 'sku'>(initialField)
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<IInventory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [products, setProducts] = useState<IInventory[]>([])
  const [error, setError] = useState<string | null>(null)

  const debouncedTerm = useDebounce(searchTerm, 300)
  const debouncedField = useDebounce(searchField, 300)

  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (debouncedTerm) {
      if (debouncedField === 'name') params.set('searchName', debouncedTerm)
      else params.set('searchSku', debouncedTerm)
    }
    const newQuery = params.toString()
    if (newQuery !== searchParams.toString()) {
      router.replace(`?${newQuery}`)
    }
  }, [page, debouncedTerm, debouncedField, router, searchParams])

  useEffect(() => {
    setPage(1)
  }, [debouncedTerm, debouncedField])

  const { data, status, isFetching, isError, refetch } = useInventoryList({
    page,
    pageSize,
    searchName: debouncedField === 'name' ? debouncedTerm : undefined,
    searchSku: debouncedField === 'sku' ? debouncedTerm : undefined,
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

  const isInitialLoading = status === 'pending' && !data
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div className="flex border border-neutral-300 rounded overflow-hidden">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-2 py-1 outline-none"
          />
          <select
            value={searchField}
            onChange={e => setSearchField(e.target.value as 'name' | 'sku')}
            className="px-2 py-1 bg-neutral-100 border-l border-neutral-300"
          >
            <option value="name">Название</option>
            <option value="sku">Артикул</option>
          </select>
        </div>
        <Button
          className="ml-auto bg-primary-500 text-white px-4 py-1"
          onClick={() => setIsCreating(true)}
        >
          Добавить товар
        </Button>
      </div>

      {isError && products.length === 0 && (
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
      <div
        className={`inventory-table ${
          isFetching && !isInitialLoading ? 'loading' : ''
        }`}
        style={{ minHeight: pageSize * ROW_HEIGHT }}
      >
        <table className="min-w-full bg-neutral-100 rounded shadow-md">
          <thead>
            <tr className="text-left border-b border-neutral-300">
              <th className="p-2 cursor-pointer" onClick={() => handleSort('name')}>
                <span className="inline-flex items-center">
                  Название
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th className="p-2">Категория</th>
              <th className="p-2">Артикул</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('quantity')}>
                <span className="inline-flex items-center">
                  Остаток
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'quantity' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('price')}>
                <span className="inline-flex items-center">
                  Цена продажи
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {isInitialLoading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="row animate-pulse">
                  <td colSpan={6} className="p-2">
                    <div className="h-4 bg-neutral-200 rounded" />
                  </td>
                </tr>
              ))}
            {!isInitialLoading && products.length === 0 && (
              <tr className="row">
                <td colSpan={6} className="p-2 text-center">
                  Нет данных
                </td>
              </tr>
            )}
            {!isInitialLoading &&
              products.map(prod => (
                <tr
                  key={prod.id}
                  className="row border-b border-neutral-200 hover:bg-neutral-200"
                >
                  <td className="p-2">{prod.name}</td>
                  <td className="p-2">{prod.category?.name || '-'}</td>
                  <td className="p-2">{prod.code}</td>
                  <td className="p-2">{prod.quantity}</td>
                  <td className="p-2">{formatCurrency(prod.price)}</td>
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
      </div>

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
        <Modal isOpen={isCreating} onClose={() => setIsCreating(false)}>
          <div className="add-product-modal">
            <ProductForm
              onSuccess={() => {
                refetch()
                setIsCreating(false)
              }}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        </Modal>
      )}
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  )
}

export default ProductsTable
