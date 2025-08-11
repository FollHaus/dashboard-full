import axios from '@/api/interceptor'
import { ITopProduct } from '@/shared/interfaces/top-product.interface'

export const AnalyticsService = {
  async getTopProducts(limit?: number) {
    const params: any = {}
    if (limit) params.limit = limit
    const res = await axios.get<ITopProduct[]>('/analytics/top-products', { params })
    return res.data
  },
}
