"use client"

import { useQuery } from '@tanstack/react-query'
import { ProductService } from '@/services/product/product.service'
import {
  InventoryList,
  IInventory,
} from '@/shared/interfaces/inventory.interface'

export interface InventoryListParams {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  filters?: Record<string, string>
}

export const useInventoryList = (params: InventoryListParams) => {
  return useQuery<InventoryList, Error>({
    queryKey: ['inventory', params],
    queryFn: ({ signal }) =>
      ProductService.getAll(undefined, signal).then(products => {
        const items: IInventory[] = products.map(p => ({
          id: p.id,
          name: p.name,
          code: p.articleNumber,
          quantity: p.remains,
          price: p.salePrice,
          status: p.remains > 0 ? 'in_stock' : 'out_of_stock',
          updatedAt: (p as any).updatedAt,
          category: (p as any).category,
        }))

        let filtered = items
        if (params.search) {
          const q = params.search.toLowerCase()
          filtered = filtered.filter(
            it =>
              it.name.toLowerCase().includes(q) ||
              it.code.toLowerCase().includes(q)
          )
        }

        if (params.sort) {
          const [key, order] = params.sort.split(':') as [keyof IInventory, string]
          filtered = [...filtered].sort((a, b) => {
            const av = a[key]
            const bv = b[key]
            if (av < bv) return order === 'desc' ? 1 : -1
            if (av > bv) return order === 'desc' ? -1 : 1
            return 0
          })
        }

        const pageSize = params.pageSize ?? filtered.length
        const page = params.page ?? 1
        const total = filtered.length
        const start = (page - 1) * pageSize
        const paginated = filtered.slice(start, start + pageSize)

        return { items: paginated, total, page, pageSize }
      }),
    keepPreviousData: true,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export default useInventoryList
