'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/ui/Button/Button'
import { FaEdit, FaTrash, FaPrint, FaFileExport, FaSearch } from 'react-icons/fa'
import { MdRemoveShoppingCart } from 'react-icons/md'
import { HiOutlineArchiveBoxArrowDown } from 'react-icons/hi2'
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
  stockTone,
} from '@/utils/inventoryStats'
import EditProductForm from './EditProductForm'
import './ProductsTable.css'

interface ProductsTableProps {
  isAddOpen: boolean
  onCloseAdd: () => void
}

const ProductsTable = ({ isAddOpen, onCloseAdd }: ProductsTableProps) => {
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
    article: string
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
      code: data.article,
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
    <>
      <div className="space-y-4 pb-24">
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg mb-2">Фильтры и поиск</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[10rem]">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 h-11 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          {stockOptions.map(opt => {
            const isActive = stockFilter === opt.value
            const base =
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors select-none focus:outline-none focus:ring-2'
            let variant = ''
            if (isActive) {
              switch (opt.value) {
                case 'low':
                  variant =
                    'bg-warning text-neutral-950 hover:brightness-95 focus:ring-warning'
                  break
                case 'out':
                  variant =
                    'bg-error text-neutral-50 hover:brightness-95 focus:ring-error'
                  break
                default:
                  variant =
                    'bg-primary-500 text-neutral-50 hover:bg-primary-400 focus:ring-primary-300'
              }
            } else {
              variant =
                'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-primary-300 dark:bg-neutral-600 dark:text-neutral-50 dark:hover:bg-neutral-500'
            }
            return (
              <button
                key={opt.value}
                aria-pressed={isActive}
                className={`${base} ${variant}`}
                onClick={() => setStockFilter(opt.value)}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {isError && !data ? (
        <div className="text-center text-error py-4">
          Ошибка загрузки
          <Button
            className="ml-2 bg-brand-600 text-white px-4 py-1"
            onClick={() => refetch()}
          >
            Повторить
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-4 md:p-5 shadow-sm border border-red-100 bg-red-50 text-red-700 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <MdRemoveShoppingCart className="w-5 h-5 text-red-600" aria-hidden="true" />
                <span className="text-sm text-gray-600">Нет в наличии</span>
              </div>
              {isInitialLoading ? (
                <div className="mt-2 h-7 w-10 bg-red-100 rounded animate-pulse" />
              ) : (
                <div className="mt-2 text-2xl md:text-3xl font-semibold">{stats.outOfStock}</div>
              )}
            </div>
            <div className="rounded-2xl p-4 md:p-5 shadow-sm border border-orange-100 bg-orange-50 text-orange-700 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <HiOutlineArchiveBoxArrowDown className="w-5 h-5 text-orange-600" aria-hidden="true" />
                <span className="text-sm text-gray-600">Мало на складе</span>
              </div>
              {isInitialLoading ? (
                <div className="mt-2 h-7 w-10 bg-orange-100 rounded animate-pulse" />
              ) : (
                <div className="mt-2 text-2xl md:text-3xl font-semibold">{stats.lowStock}</div>
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
              <FaFileExport aria-hidden="true" />
            </Button>
            <Button
              className="bg-neutral-200 px-2 py-1"
              onClick={() => window.print()}
              title="Печать"
              aria-label="Печать"
            >
              <FaPrint aria-hidden="true" />
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
        <table className="table-fixed w-full border-collapse bg-gray-50 rounded shadow-md">
          <thead>
            <tr className="border-b border-neutral-300">
              <th
                className="w-1/6 px-3 py-2 cursor-pointer text-left text-sm font-medium text-gray-600 uppercase tracking-wide truncate"
                onClick={() => handleSort('name')}
              >
                <span className="inline-flex items-center">
                  Название
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th className="w-1/6 px-3 py-2 text-left text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                Категория
              </th>
              <th className="w-1/6 px-3 py-2 text-left text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                Артикул
              </th>
              <th
                className="w-1/6 px-3 py-2 cursor-pointer text-right text-sm font-medium text-gray-600 uppercase tracking-wide"
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
                className="w-1/6 px-3 py-2 cursor-pointer text-right text-sm font-medium text-gray-600 uppercase tracking-wide"
                onClick={() => handleSort('price')}
              >
                <span className="inline-flex items-center">
                  Цена продажи
                  <span className="ml-1 inline-block w-4">
                    {sortField === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </span>
              </th>
              <th className="w-1/6 px-3 py-2 text-right text-sm font-medium text-gray-600 uppercase tracking-wide">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isInitialLoading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="row animate-pulse">
                  <td className="w-1/6 px-3 py-2 text-left">
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  </td>
                  <td className="w-1/6 px-3 py-2 text-left">
                    <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  </td>
                  <td className="w-1/6 px-3 py-2 text-left">
                    <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  </td>
                  <td className="w-1/6 px-3 py-2 text-right">
                    <div className="h-4 bg-neutral-200 rounded w-1/2 ml-auto" />
                  </td>
                  <td className="w-1/6 px-3 py-2 text-right">
                    <div className="h-4 bg-neutral-200 rounded w-1/4 ml-auto" />
                  </td>
                  <td className="w-1/6 px-3 py-2 text-right">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full ml-auto" />
                  </td>
                </tr>
              ))}
            {!isInitialLoading && products.length === 0 && (
              <tr className="row">
                <td colSpan={6} className="px-3 py-2 text-center">
                  Товары не найдены
                </td>
              </tr>
            )}
            {!isInitialLoading &&
              products.map((prod, index) => (
                <tr
                  key={prod.id}
                  className="row border-b border-neutral-200 odd:bg-white even:bg-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td
                    className="w-1/6 px-3 py-2 text-left truncate"
                    title={prod.name}
                  >
                    {prod.name}
                  </td>
                  <td
                    className="w-1/6 px-3 py-2 text-left truncate"
                    title={prod.category?.name || '-'}
                  >
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
                      <span className="truncate">
                        {prod.category?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td
                    className="w-1/6 px-3 py-2 text-left truncate"
                    title={prod.code}
                  >
                    {prod.code}
                  </td>
                  <td className="w-1/6 px-3 py-2 text-right">
                    <div
                      className={`inline-flex items-center justify-end min-w-[3rem] px-2 py-1 rounded-lg whitespace-nowrap ${stockTone(
                        prod.quantity,
                        prod.minStock,
                      )}`}
                    >
                      <span className="tabular-nums">{prod.quantity}</span>
                      {prod.quantity > 0 && isLowStock(prod.quantity, prod.minStock) && (
                        <span className="ml-2 rounded-full bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5">
                          Мало
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="w-1/6 px-3 py-2 text-right tabular-nums">
                    {formatCurrency(prod.price)}
                  </td>
                  <td className="w-1/6 px-3 py-2 text-right">
                    <button
                      aria-haspopup="menu"
                      aria-expanded={openMenuProductId === prod.id}
                      aria-label="Действия"
                      title="Действия"
                      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-2 py-2 mt-4">
        <button
          disabled={page <= 1}
          className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Назад"
          title="Назад"
          onClick={() => page > 1 && setPage(p => Math.max(1, p - 1))}
        >
          ‹
        </button>
        <span className="mx-2 text-sm text-gray-600">
          Стр. {page} из {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Вперёд"
          title="Вперёд"
          onClick={() => page < totalPages && setPage(p => Math.min(totalPages, p + 1))}
        >
          ›
        </button>
      </div>
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
    {editingIndex !== null && (
      <Modal isOpen={editingIndex !== null} onClose={() => setEditingIndex(null)}>
        <EditProductForm
          product={{
            id: products[editingIndex].id,
            name: products[editingIndex].name,
            article: products[editingIndex].code,
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
    {isAddOpen && (
      <Modal isOpen={isAddOpen} onClose={onCloseAdd}>
        <div className="add-product-modal">
          <ProductForm
            onSuccess={() => {
              refetch()
              onCloseAdd()
            }}
            onCancel={onCloseAdd}
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
            className="px-4 py-2 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
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
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-brand-500"
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
  </>
)
}

export default ProductsTable
