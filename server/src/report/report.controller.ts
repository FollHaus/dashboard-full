import {
        Body,
        Controller,
        Get,
        Param,
        ParseIntPipe,
        Post,
        UseGuards,
        ValidationPipe
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ReportService } from './report.service'
import { GenerateReportDto } from './dto/generate-report.dto'

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportController {
        constructor(private readonly reportService: ReportService) {}

        @Get()
        getAvailable() {
                return this.reportService.getAvailable()
        }

        @Post('generate')
        generate(@Body(new ValidationPipe()) dto: GenerateReportDto) {
                return this.reportService.generate(dto)
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
