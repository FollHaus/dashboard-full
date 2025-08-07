import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'
import { ReportModel } from './report.model'

@Module({
        imports: [SequelizeModule.forFeature([ReportModel])],
        controllers: [ReportController],
        providers: [ReportService]
})
export class ReportModule {}

