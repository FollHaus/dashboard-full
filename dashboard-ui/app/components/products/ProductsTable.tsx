'use client'

import { useEffect, useState } from 'react'
import Button from '@/ui/Button/Button'
import { ProductService } from '@/services/product/product.service'
import ProductForm from './ProductForm'
import ProductDetails from './ProductDetails'
import { useInventoryList } from '@/hooks/useInventoryList'
import { IInventory } from '@/shared/interfaces/inventory.interface'

const ProductsTable = () => {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<IInventory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [products, setProducts] = useState<IInventory[]>([])
  const [error, setError] = useState<string | null>(null)

  const { data, status, error: queryError, refetch } = useInventoryList({
    page,
    pageSize,
    search,
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

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1

  return (
    <div>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-neutral-300 rounded px-2 py-1"
        />
        <Button
          className="bg-primary-500 text-white px-4 py-1"
          onClick={() => setIsCreating(true)}
        >
          Добавить товар
        </Button>
      </div>

      {status === 'pending' && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {status === 'error' && products.length === 0 && (
        <div className="text-center text-error py-4">
          {queryError?.message || 'Не удалось загрузить товары'}
          <Button
            className="ml-2 bg-primary-500 text-white px-4 py-1"
            onClick={() => refetch()}
          >
            Обновить
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
                    Nothing found
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

          <div className="flex justify-center mt-4 space-x-2">
            <Button
              className="px-3 py-1 bg-neutral-200"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </Button>
            <span>{page} / {totalPages}</span>
            <Button
              className="px-3 py-1 bg-neutral-200"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>

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
