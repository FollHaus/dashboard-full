import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common'
import { ReportService } from './report.service'
import { GenerateReportDto } from './dto/generate-report.dto'

@Controller('reports')
export class ReportController {
        constructor(private readonly reportService: ReportService) {}

        @Get()
        getAvailable() {
                return this.reportService.getAvailable()
        }

        @Post('generate')
        generate(@Body() dto: GenerateReportDto) {
                return this.reportService.generate(dto.type, dto.params)
        }

        @Get('history')
        history() {
                return this.reportService.getHistory()
        }

        @Get(':id/export/:format')
        export(
                @Param('id', ParseIntPipe) id: number,
                @Param('format') format: string
        ) {
                return this.reportService.export(id, format)
        }
}
