import axios from '../../api/interceptor'
import { ITopProduct } from '@/shared/interfaces/top-product.interface'
import { ISalesStat } from '@/shared/interfaces/sales-stat.interface'
import { ITurnover } from '@/shared/interfaces/turnover.interface'

export const AnalyticsService = {
  async getTopProducts(limit?: number) {
    const params: any = {}
    if (limit) params.limit = limit
    const res = await axios.get<ITopProduct[]>('/analytics/top-products', { params })
    return res.data
  },
  async getSales(period: number) {
    const res = await axios.get<ISalesStat[]>(`/analytics/sales`, { params: { period } })
    return res.data
  },
  async getTurnover() {
    const res = await axios.get<ITurnover>(`/analytics/turnover`)
    return res.data
  },
}
