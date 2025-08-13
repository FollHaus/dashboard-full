"use client"

import { useQuery } from '@tanstack/react-query'
import { ProductService } from '@/services/product/product.service'
import { IProduct } from '@/shared/interfaces/product.interface'

export const useWarehouseData = () =>
  useQuery<IProduct[], Error>({
    queryKey: ['warehouse'],
    queryFn: ({ signal }) => ProductService.getAll(signal),
    retry: 1,
    refetchOnWindowFocus: false,
  })

export default useWarehouseData
