'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/ui/Button/Button'
import { FaChevronLeft, FaChevronRight, FaEdit } from 'react-icons/fa'
import { ProductService } from '@/services/product/product.service'
import ProductForm from './ProductForm'
import Modal from '@/ui/Modal/Modal'
import { useInventoryList } from '@/hooks/useInventoryList'
import { IInventory } from '@/shared/interfaces/inventory.interface'
import useDebounce from '@/hooks/useDebounce'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  calculateInventoryStats,
  DEFAULT_MIN_STOCK,
  isLowStock,
} from '@/utils/inventoryStats'
import EditProductForm from './EditProductForm'
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [products, setProducts] = useState<IInventory[]>([])
  const [stats, setStats] = useState({ outOfStock: 0, lowStock: 0 })
  const [error, setError] = useState<string | null>(null)
  const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low'>('all')

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
  }, [debouncedTerm, debouncedField, stockFilter])

  const { data, status, isFetching, isError, refetch } = useInventoryList({
    page,
    pageSize,
    searchName: debouncedField === 'name' ? debouncedTerm : undefined,
    searchSku: debouncedField === 'sku' ? debouncedTerm : undefined,
    sort: `${sortField}:${sortOrder}`,
    filters: stockFilter === 'all' ? undefined : { stock: stockFilter },
  })

  useEffect(() => {
    if (status === 'success' && data) {
      setProducts(data.items)
      setStats(data.stats)
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
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== id)
        setStats(calculateInventoryStats(updated, DEFAULT_MIN_STOCK))
        return updated
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleEditSuccess = (data: {
    name: string
    minStock: number
    purchasePrice: number
    salePrice: number
    remains: number
  }) => {
    if (editingIndex === null) return
    const newProducts = [...products]
    const product = newProducts[editingIndex]
    const updated = {
      ...product,
      name: data.name,
      minStock: data.minStock,
      purchasePrice: data.purchasePrice,
      price: data.salePrice,
      quantity: data.remains,
    }
    const matchesLow =
      updated.quantity > 0 && isLowStock(updated.quantity, updated.minStock)
    const matchesOut = updated.quantity === 0

    if (
      (stockFilter === 'low' && !matchesLow) ||
      (stockFilter === 'out' && !matchesOut)
    ) {
      newProducts.splice(editingIndex, 1)
    } else {
      newProducts[editingIndex] = updated
    }
    setProducts(newProducts)
    setStats(calculateInventoryStats(newProducts, DEFAULT_MIN_STOCK))
    setEditingIndex(null)
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

      {isError && !data ? (
        <div className="text-center text-error py-4">
          Ошибка загрузки
          <Button
            className="ml-2 bg-primary-500 text-white px-4 py-1"
            onClick={() => refetch()}
          >
            Повторить
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            className={`h-24 p-4 bg-white rounded shadow cursor-pointer flex flex-col items-center justify-center ${
              stockFilter === 'out' ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() =>
              setStockFilter(f => (f === 'out' ? 'all' : 'out'))
            }
          >
            <div className="text-sm">Нет в наличии</div>
            {isInitialLoading ? (
              <div className="mt-1 h-6 w-8 bg-neutral-200 rounded animate-pulse" />
            ) : (
              <div className="text-xl font-semibold">{stats.outOfStock}</div>
            )}
          </div>
          <div
            className={`h-24 p-4 bg-white rounded shadow cursor-pointer flex flex-col items-center justify-center ${
              stockFilter === 'low' ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() =>
              setStockFilter(f => (f === 'low' ? 'all' : 'low'))
            }
          >
            <div className="text-sm">Мало на складе</div>
            {isInitialLoading ? (
              <div className="mt-1 h-6 w-8 bg-neutral-200 rounded animate-pulse" />
            ) : (
              <div className="text-xl font-semibold">{stats.lowStock}</div>
            )}
          </div>
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
              <th
                className="p-2 cursor-pointer col-name"
                onClick={() => handleSort('name')}
              >
                <span className="inline-flex items-center">
                  Название
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th className="p-2 col-category">Категория</th>
              <th className="p-2 col-code">Артикул</th>
              <th
                className="p-2 cursor-pointer col-quantity"
                onClick={() => handleSort('quantity')}
              >
                <span className="inline-flex items-center">
                  Остаток
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'quantity' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th
                className="p-2 cursor-pointer col-sale"
                onClick={() => handleSort('price')}
              >
                <span className="inline-flex items-center">
                  Цена продажи
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th className="p-2 col-purchase">Закупочная цена</th>
              <th className="p-2 col-actions">Действия</th>
            </tr>
          </thead>
          <tbody>
            {isInitialLoading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="row animate-pulse">
                  <td className="p-2 col-name">
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  </td>
                  <td className="p-2 col-category">
                    <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  </td>
                  <td className="p-2 col-code">
                    <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  </td>
                  <td className="p-2 col-quantity">
                    <div className="h-4 bg-neutral-200 rounded w-1/4 ml-auto" />
                  </td>
                  <td className="p-2 col-sale">
                    <div className="h-4 bg-neutral-200 rounded w-1/4 ml-auto" />
                  </td>
                  <td className="p-2 col-purchase">
                    <div className="h-4 bg-neutral-200 rounded w-1/4 ml-auto" />
                  </td>
                  <td className="p-2 col-actions">
                    <div className="h-4 bg-neutral-200 rounded w-1/2 ml-auto" />
                  </td>
                </tr>
              ))}
            {!isInitialLoading && products.length === 0 && (
              <tr className="row">
                <td colSpan={7} className="p-2 text-center">
                  Нет данных
                </td>
              </tr>
            )}
            {!isInitialLoading &&
              products.map((prod, index) => (
                <tr
                  key={prod.id}
                  className="row border-b border-neutral-200 hover:bg-neutral-200"
                >
                  <td className="p-2 col-name" title={prod.name}>
                    <span className="block truncate">{prod.name}</span>
                  </td>
                  <td className="p-2 col-category" title={prod.category?.name || '-'}>
                    <span className="block truncate">{prod.category?.name || '-'}</span>
                  </td>
                  <td className="p-2 col-code" title={prod.code}>
                    <span className="block truncate">{prod.code}</span>
                  </td>
                  <td className="p-2 col-quantity">
                    {prod.quantity}
                    {prod.quantity > 0 &&
                      isLowStock(prod.quantity, prod.minStock) && (
                        <span className="ml-2 bg-warning text-white text-xs px-2 py-0.5 rounded">
                          мало
                        </span>
                      )}
                  </td>
                  <td className="p-2 col-sale">{formatCurrency(prod.price)}</td>
                  <td className="p-2 col-purchase">{formatCurrency(prod.purchasePrice)}</td>
                  <td className="p-2 col-actions space-x-2 flex justify-end">
                    <Button
                      className="bg-primary-500 text-white p-2"
                      onClick={() => setEditingIndex(index)}
                      title="Редактировать"
                      aria-label="Редактировать"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      className="bg-error text-white px-2 py-1"
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
        <div className="flex justify-center mt-4 space-x-2 items-center">
          {page > 1 && (
            <Button
              className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              aria-label="Предыдущий товар"
              title="Предыдущий товар"
            >
              <FaChevronLeft />
            </Button>
          )}
          <span>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button
              className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              aria-label="Следующий товар"
              title="Следующий товар"
            >
              <FaChevronRight />
            </Button>
          )}
        </div>
      )}
      {editingIndex !== null && (
        <Modal
          isOpen={editingIndex !== null}
          onClose={() => setEditingIndex(null)}
        >
          <EditProductForm
            product={{
              id: products[editingIndex].id,
              name: products[editingIndex].name,
              minStock: products[editingIndex].minStock,
              purchasePrice: products[editingIndex].purchasePrice,
              salePrice: products[editingIndex].price,
              remains: products[editingIndex].quantity,
            }}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingIndex(null)}
          />
        </Modal>
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
