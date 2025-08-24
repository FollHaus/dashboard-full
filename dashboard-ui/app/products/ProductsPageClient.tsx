'use client'

import ProductsTable from '@/components/products/ProductsTable'
import { useState } from 'react'

export default function ProductsPageClient() {
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
      <ProductsTable isAddOpen={isAddOpen} onCloseAdd={() => setIsAddOpen(false)} />
      {!isAddOpen && (
        <div className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 pb-[env(safe-area-inset-bottom)]">
          <button
            aria-label="Добавить товар"
            title="Добавить товар"
            onClick={() => setIsAddOpen(true)}
            className="rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-primary-500 hover:bg-primary-400 text-neutral-50 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-transform hover:scale-105 active:scale-95"
          >
            +
          </button>
        </div>
      )}
    </>
  )
}
