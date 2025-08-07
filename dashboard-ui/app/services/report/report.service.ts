import { axiosClassic } from '@/api/interceptor'

export const ReportService = {
  /**
   * GET /reports
   * Список доступных отчётов.
   */
  async getAvailable() {
    const response = await axiosClassic.get('/reports')
    return response.data
  },

  /**
   * POST /reports/generate
   * Генерация отчёта по переданным параметрам.
   */
  async generate(data: any) {
    const response = await axiosClassic.post('/reports/generate', data)
    return response.data
  },

  /**
   * GET /reports/history
   * История сгенерированных отчётов.
   */
  async getHistory() {
    const response = await axiosClassic.get('/reports/history')
    return response.data
  },

  /**
   * GET /reports/:id/export/:format
   * Выгрузка отчёта в указанном формате (pdf, excel).
   */
  async export(id: number, format: string) {
    const response = await axiosClassic.get(`/reports/${id}/export/${format}`, {
      responseType: 'blob',
    })
    return response.data
  },
}
