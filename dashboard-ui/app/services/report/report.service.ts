import { axiosClassic } from '@/api/interceptor'

export const ReportService = {
  async getAvailable() {
    const response = await axiosClassic.get('/reports')
    return response.data
  },

  async generate(data: any) {
    const response = await axiosClassic.post('/reports/generate', data)
    return response.data
  },

  async getHistory() {
    const response = await axiosClassic.get('/reports/history')
    return response.data
  },

  async export(id: number, format: string) {
    const response = await axiosClassic.get(`/reports/${id}/export/${format}`, {
      responseType: 'blob',
    })
    return response.data
  },
}
