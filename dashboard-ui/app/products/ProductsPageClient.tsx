'use client'

import ProductsTable from '@/components/products/ProductsTable'
import { useState } from 'react'
import Fab from '@/components/ui/Fab'

export default function ProductsPageClient() {
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
      <ProductsTable isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      {!isAddOpen && (
        <Fab
          aria-label="Добавить товар"
          title="Добавить товар"
          onClick={() => setIsAddOpen(true)}
        />
      )}
    </>
  )
}
