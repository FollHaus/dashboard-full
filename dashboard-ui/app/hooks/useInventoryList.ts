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
  searchName?: string
  searchSku?: string
  sort?: string
  filters?: Record<string, string>
}

export const useInventoryList = (params: InventoryListParams) => {
  return useQuery<InventoryList, Error>({
    queryKey: ['inventory', params],
    queryFn: ({ signal }) =>
      ProductService.getAll(
        {
          page: params.page,
          pageSize: params.pageSize,
          searchName: params.searchName,
          searchSku: params.searchSku,
        },
        signal
      ).then(products => {
        const items: IInventory[] = products.map(p => ({
          id: p.id,
          name: p.name,
          code: p.articleNumber,
          quantity: p.remains,
          price: Number(p.salePrice),
          status: p.remains > 0 ? 'in_stock' : 'out_of_stock',
          updatedAt: (p as any).updatedAt,
          category: (p as any).category,
        }))

        let filtered = items
        if (params.searchName) {
          const q = params.searchName.toLowerCase()
          filtered = filtered.filter(it => it.name.toLowerCase().includes(q))
        }
        if (params.searchSku) {
          const q = params.searchSku.toLowerCase()
          filtered = filtered.filter(it => it.code.toLowerCase().includes(q))
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
