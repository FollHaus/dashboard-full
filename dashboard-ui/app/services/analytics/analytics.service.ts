import axios from '../../api/interceptor'
import { ITopProduct } from '@/shared/interfaces/top-product.interface'
import { ISalesStat } from '@/shared/interfaces/sales-stat.interface'
import { ITurnover } from '@/shared/interfaces/turnover.interface'

export const AnalyticsService = {
  async getTopProducts(
    limit?: number,
    startDate?: string,
    endDate?: string,
    categories?: number[]
  ) {
    const params: any = {}
    if (limit) params.limit = limit
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (categories && categories.length) params.categories = categories.join(',')
    const res = await axios.get<ITopProduct[]>('/analytics/top-products', { params })
    return res.data
  },
  async getDailyRevenue(
    startDate?: string,
    endDate?: string,
    categories?: number[]
  ) {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (categories && categories.length) params.categories = categories.join(',')
    const res = await axios.get<ISalesStat[]>(`/analytics/daily-revenue`, {
      params,
    })
    return res.data
  },
  async getKpis(
    startDate?: string,
    endDate?: string,
    categories?: number[]
  ) {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (categories && categories.length) params.categories = categories.join(',')
    const res = await axios.get(
      '/analytics/kpis',
      { params }
    )
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
  async getProductRemains() {
    const res = await axios.get<number>(`/analytics/product-remains`)
    return res.data
  },
  async getOpenTasks() {
    const res = await axios.get<number>(`/analytics/open-tasks`)
    return res.data
  },
}
