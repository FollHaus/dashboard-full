import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { ReportModel } from './report.model'

@Injectable()
export class ReportService {
        constructor(
                @InjectModel(ReportModel)
                private reportRepo: typeof ReportModel
        ) {}

        getAvailable() {
                return [
                        { id: 1, name: 'sales' },
                        { id: 2, name: 'inventory balances' },
                        { id: 3, name: 'task efficiency' }
                ]
        }

        async generate(type: string, params: any) {
                return this.reportRepo.create({
                        type,
                        params,
                        data: { message: `data for ${type}` }
                })
        }

        getHistory() {
                return this.reportRepo.findAll()
        }

        async export(id: number, format: string) {
                const report = await this.reportRepo.findByPk(id)
                if (!report) {
                        return { message: `Report ${id} not found` }
                }
                return { message: `Report ${id} exported to ${format}` }
        }
}

