import Layout from '@/ui/Layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Report',
}

export default function NewReportPage() {
  return (
    <Layout>
      <div>Новый отчёт</div>
    </Layout>
  )
}
