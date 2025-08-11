import Layout from '@/ui/Layout'
import ProductsTable from '@/components/products/ProductsTable'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Склад'
}

export default function ProductsPage() {
  return (
    <Layout>
      <ProductsTable />
    </Layout>
  )
}
