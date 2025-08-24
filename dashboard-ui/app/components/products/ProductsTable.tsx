'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/ui/Button/Button'
import {
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrash,
  FaPrint,
  FaFileExport,
} from 'react-icons/fa'
import { createPortal } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast'
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
  const initialTerm = searchParams.get('search') || ''

  const [page, setPage] = useState(initialPage)
  const [pageSize] = useState(10)
  const ROW_HEIGHT = 44
  const [searchTerm, setSearchTerm] = useState(initialTerm)
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [products, setProducts] = useState<IInventory[]>([])
  const [stats, setStats] = useState({
    outOfStock: 0,
    lowStock: 0,
    totalCount: 0,
    purchaseValue: 0,
    saleValue: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const initialStock =
    (searchParams.get('stock') as 'all' | 'in' | 'low' | 'out' | null) || 'all'
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>(
    initialStock,
  )
  const [openMenuProductId, setOpenMenuProductId] = useState<number | null>(
    null,
  )
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const [confirmingProduct, setConfirmingProduct] = useState<IInventory | null>(
    null,
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const debouncedTerm = useDebounce(searchTerm, 300)

  const stockOptions = [
    { value: 'all', label: 'Все' },
    { value: 'in', label: 'В наличии' },
    { value: 'low', label: 'Мало' },
    { value: 'out', label: 'Нет в наличии' },
  ] as const

  const getCategoryColor = (name: string) => {
    const colors = [
      'bg-red-200',
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-purple-200',
      'bg-pink-200',
    ]
    const code = name.charCodeAt(0)
    return colors[code % colors.length]
  }

  const getQuantityColor = (q: number) => {
    if (q > 100) return 'bg-green-100'
    if (q >= 20) return 'bg-orange-100'
    return 'bg-red-100'
  }

  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (debouncedTerm) params.set('search', debouncedTerm)
    if (stockFilter !== 'all') params.set('stock', stockFilter)
    const newQuery = params.toString()
    if (newQuery !== searchParams.toString()) {
      router.replace(`?${newQuery}`)
    }
  }, [page, debouncedTerm, stockFilter, router, searchParams])

  useEffect(() => {
    const saved = localStorage.getItem('stockFilter') as
      | 'all'
      | 'in'
      | 'low'
      | 'out'
      | null
    if (!searchParams.get('stock') && saved) setStockFilter(saved)
  }, [searchParams])

  useEffect(() => {
    localStorage.setItem('stockFilter', stockFilter)
  }, [stockFilter])

  useEffect(() => {
    setPage(1)
  }, [debouncedTerm, stockFilter])

  useEffect(() => {
    if (!openMenuProductId) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuProductId(null)
        menuButtonRef.current?.focus()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuProductId(null)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [openMenuProductId])

  useEffect(() => {
    if (!openMenuProductId) return
    const updatePosition = () => {
      const rect = menuButtonRef.current?.getBoundingClientRect()
      if (rect) {
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        })
      }
    }
    const handleResize = () => {
      setOpenMenuProductId(null)
      menuButtonRef.current?.focus()
    }
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', handleResize)
    updatePosition()
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [openMenuProductId])

  useEffect(() => {
    if (!openMenuProductId) return
    const first = menuRef.current?.querySelector<HTMLElement>('button[role="menuitem"]')
    first?.focus()
  }, [openMenuProductId])

  const { data, status, isFetching, isError, refetch } = useInventoryList({
    page,
    pageSize,
    search: debouncedTerm,
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
    setDeletingId(id)
    try {
      await ProductService.delete(id)
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== id)
        setStats(calculateInventoryStats(updated, DEFAULT_MIN_STOCK))
        return updated
      })
      toast.success('Товар удалён')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-snapshot'] })
    } catch (e: any) {
      setError(e.message)
      toast.error('Не удалось удалить')
    } finally {
      setDeletingId(null)
    }
  }

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      'button[role="menuitem"]',
    )
    if (!items || items.length === 0) return
    const arr = Array.from(items)
    const index = arr.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      arr[(index + 1) % arr.length].focus()
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault()
      arr[(index - 1 + arr.length) % arr.length].focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpenMenuProductId(null)
      menuButtonRef.current?.focus()
    }
  }

  const handleExport = () => {
    const headers = [
      'Название',
      'Категория',
      'Артикул',
      'Остаток',
      'Цена продажи',
      'Закупочная цена',
    ]
    const rows = products.map(p => [
      p.name,
      p.category?.name || '-',
      p.code,
      p.quantity,
      p.price,
      p.purchasePrice,
    ])
    const csv = [headers.join(',')]
      .concat(rows.map(r => r.join(',')))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'inventory.csv'
    link.click()
    URL.revokeObjectURL(url)
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
    <div className="space-y-4">
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg mb-2">Фильтры и поиск</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-2 py-1 border border-neutral-300 rounded outline-none flex-1 min-w-[10rem]"
          />
          {stockOptions.map(opt => (
            <button
              key={opt.value}
              className={`px-3 py-1 rounded border text-sm ${
                stockFilter === opt.value
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white'
              }`}
              onClick={() => setStockFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <button
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsCreating(true)}
            aria-label="Добавить товар"
            title="Добавить товар"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">+</span>
            <span className="hidden sm:inline">Добавить товар</span>
          </button>
        </div>
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
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 p-4 bg-red-500 text-white rounded-lg shadow flex flex-col items-center justify-center">
              <div className="text-lg">Нет в наличии</div>
              {isInitialLoading ? (
                <div className="mt-1 h-6 w-8 bg-red-300 rounded animate-pulse" />
              ) : (
                <div className="text-3xl font-bold">{stats.outOfStock}</div>
              )}
            </div>
            <div className="h-28 p-4 bg-orange-500 text-white rounded-lg shadow flex flex-col items-center justify-center">
              <div className="text-lg">Мало на складе</div>
              {isInitialLoading ? (
                <div className="mt-1 h-6 w-8 bg-orange-300 rounded animate-pulse" />
              ) : (
                <div className="text-3xl font-bold">{stats.lowStock}</div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Товаров: {stats.totalCount}</span>
            <span>
              Закупочная стоимость: {formatCurrency(stats.purchaseValue)}
            </span>
            <span>
              Продажная стоимость: {formatCurrency(stats.saleValue)}
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                className="bg-neutral-200 px-2 py-1"
                onClick={handleExport}
                title="Экспорт CSV"
                aria-label="Экспорт CSV"
              >
                <FaFileExport />
              </Button>
              <Button
                className="bg-neutral-200 px-2 py-1"
                onClick={() => window.print()}
                title="Печать"
                aria-label="Печать"
              >
                <FaPrint />
              </Button>
            </div>
          </div>
        </>
      )}

      <div
        className={`inventory-table ${
          isFetching && !isInitialLoading ? 'loading' : ''
        }`}
        style={{ minHeight: pageSize * ROW_HEIGHT }}
      >
        <table className="min-w-full bg-gray-50 rounded shadow-md">
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
                    <div className="flex items-center">
                      <div className="h-4 bg-neutral-200 rounded ml-auto min-w-[3rem]" />
                    </div>
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
                  Товары не найдены
                </td>
              </tr>
            )}
            {!isInitialLoading &&
              products.map((prod, index) => (
                <tr
                  key={prod.id}
                  className={`row border-b border-neutral-200 hover:bg-neutral-200 odd:bg-white even:bg-gray-50 ${
                    prod.quantity === 0
                      ? 'bg-red-100'
                      : prod.quantity > 0 && isLowStock(prod.quantity, prod.minStock)
                        ? 'bg-yellow-100'
                        : ''
                  }`}
                >
                  <td className="p-2 col-name" title={prod.name}>
                    <span className="block truncate">{prod.name}</span>
                  </td>
                  <td className="p-2 col-category" title={prod.category?.name || '-'}>
                    <div className="flex items-center gap-2">
                      {prod.category ? (
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-neutral-700 ${getCategoryColor(
                            prod.category.name
                          )}`}
                        >
                          {prod.category.name.slice(0, 2).toUpperCase()}
                        </span>
                      ) : (
                        <span className="w-6 h-6" />
                      )}
                      <span className="block truncate">
                        {prod.category?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 col-code" title={prod.code}>
                    <span className="block truncate">{prod.code}</span>
                  </td>
                  <td className="p-2 col-quantity">
                    <div className="flex items-center">
                      <span
                        className={`text-right min-w-[3rem] px-2 py-0.5 rounded ${getQuantityColor(
                          prod.quantity
                        )}`}
                      >
                        {prod.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 col-sale">{formatCurrency(prod.price)}</td>
                  <td className="p-2 col-purchase">
                    {formatCurrency(prod.purchasePrice)}
                  </td>
                  <td className="p-2 col-actions">
                    <div className="flex justify-end">
                      <button
                        aria-haspopup="menu"
                        aria-expanded={openMenuProductId === prod.id}
                        aria-label="Действия"
                        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        onClick={e => {
                          e.stopPropagation()
                          if (openMenuProductId === prod.id) {
                            setOpenMenuProductId(null)
                            menuButtonRef.current?.focus()
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setMenuPosition({
                              top: rect.bottom + window.scrollY,
                              left: rect.left + window.scrollX,
                            })
                            menuButtonRef.current = e.currentTarget
                            setOpenMenuProductId(prod.id)
                          }
                        }}
                        title="Действия"
                        disabled={deletingId === prod.id}
                      >
                        ⋮
                      </button>
                      {openMenuProductId === prod.id &&
                        createPortal(
                          <div
                            ref={menuRef}
                            className="z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-44"
                            style={{
                              position: 'absolute',
                              top: menuPosition.top,
                              left: menuPosition.left,
                            }}
                            role="menu"
                            onKeyDown={handleMenuKeyDown}
                          >
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 disabled:opacity-50"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuProductId(null)
                                setEditingIndex(index)
                              }}
                              title="Редактировать"
                              disabled={deletingId === prod.id}
                            >
                              <FaEdit aria-hidden="true" />
                              <span>Редактировать</span>
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 text-red-600 disabled:opacity-50"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuProductId(null)
                                setConfirmingProduct(prod)
                              }}
                              title="Удалить"
                              disabled={deletingId === prod.id}
                            >
                              <FaTrash aria-hidden="true" />
                              <span>Удалить</span>
                            </button>
                          </div>,
                          document.body,
                        )}
                    </div>
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
      {confirmingProduct && (
        <Modal
          isOpen={!!confirmingProduct}
          onClose={() => {
            setConfirmingProduct(null)
            menuButtonRef.current?.focus()
          }}
          className="max-w-sm w-full rounded-2xl p-6 shadow-xl"
        >
          <p className="mb-4">
            Удалить товар «{confirmingProduct.name}»? Действие необратимо.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              onClick={async () => {
                await handleDelete(confirmingProduct.id)
                setConfirmingProduct(null)
                menuButtonRef.current?.focus()
              }}
              disabled={deletingId === confirmingProduct.id}
              title="Удалить"
            >
              {deletingId === confirmingProduct.id ? 'Удаление...' : 'Удалить'}
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                setConfirmingProduct(null)
                menuButtonRef.current?.focus()
              }}
              title="Отмена"
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  )
}

export default ProductsTable
