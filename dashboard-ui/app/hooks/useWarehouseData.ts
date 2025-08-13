"use client"

import { useQuery } from '@tanstack/react-query'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'

export const useWarehouseData = () => {
  return useQuery<IProduct[], Error>({
    queryKey: ['warehouse'],
    queryFn: ({ signal }) => ProductService.getAll(undefined, signal),
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export default useWarehouseData
