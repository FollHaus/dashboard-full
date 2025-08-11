import Layout from '@/ui/Layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Приход товара',
}

export default function ProductReceiptPage() {
  return (
    <Layout>
      <div>Приход товара</div>
    </Layout>
  )
}
