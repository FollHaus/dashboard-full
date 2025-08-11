import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'
import { ReportModel } from './report.model'
import { AnalyticsModule } from '../analytics/analytics.module'

@Module({
        imports: [SequelizeModule.forFeature([ReportModel]), AnalyticsModule],
        controllers: [ReportController],
        providers: [ReportService]
})
export class ReportModule {}

