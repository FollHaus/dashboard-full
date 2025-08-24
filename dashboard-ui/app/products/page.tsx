import Layout from '@/ui/Layout'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Склад',
}

export default function ProductsPage() {
  return (
    <Layout>
      <ProductsPageClient />
    </Layout>
  )
}
