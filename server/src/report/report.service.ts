import { Injectable } from '@nestjs/common'

interface GeneratedReport {
        id: number
        type: string
        params: any
        data: any
        createdAt: Date
}

@Injectable()
export class ReportService {
        private reports: GeneratedReport[] = []
        private counter = 1

        getAvailable() {
                return [
                        { id: 1, name: 'sales' },
                        { id: 2, name: 'inventory balances' },
                        { id: 3, name: 'task efficiency' }
                ]
        }

        generate(type: string, params: any) {
                const report: GeneratedReport = {
                        id: this.counter++,
                        type,
                        params,
                        data: { message: `data for ${type}` },
                        createdAt: new Date()
                }
                this.reports.push(report)
                return report
        }

        getHistory() {
                return this.reports
        }

        export(id: number, format: string) {
                return { message: `Report ${id} exported to ${format}` }
        }
}
