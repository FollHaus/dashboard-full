import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

// Маршруты этого контроллера используются как публичные
// (например, для health check), поэтому защита JWT здесь не нужна.
@Controller()
export class AppController {
        constructor(private readonly appService: AppService) {}

        @Get()
        getHello(): string {
                return this.appService.getHello()
        }
}
