import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AnalyticsService } from './analytics.service'
import { ProductModel } from '../product/product.model'
import { AnalyticsQueryDto } from './dto/analytics.query.dto'
import { LowStockQueryDto } from './dto/low-stock.query.dto'

@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	/**
	 * Получает общую выручку за определённый период.
	 *
	 * @param startDate - Дата начала периода (строка)
	 * @param endDate - Дата окончания периода (строка)
	 * @param categories - Строка с ID категорий через запятую
	 * @returns Промис с числом — суммарной выручкой
	 */
        @Get('revenue')
        getRevenue(
                @Query(new ValidationPipe({ transform: true }))
                query: AnalyticsQueryDto
        ): Promise<number> {
                const { startDate, endDate, categories } = query
                return this.analyticsService.getRevenue(startDate, endDate, categories)
        }

	/**
	 * Получает данные о продажах по категориям за определённый период.
	 *
	 * @param startDate - Дата начала периода (строка)
	 * @param endDate - Дата окончания периода (строка)
	 * @param categories - Строка с ID категорий через запятую
	 * @returns Промис с массивом данных о продажах
	 */
        @Get('category-sales')
        getCategorySales(
                @Query(new ValidationPipe({ transform: true }))
                query: AnalyticsQueryDto
        ): Promise<any[]> {
                const { startDate, endDate, categories } = query
                return this.analyticsService.getSalesByCategories(startDate, endDate, categories)
        }

	/**
	 * Получает список товаров с низким уровнем запасов.
	 *
	 * @param threshold - Пороговое значение количества товара (по умолчанию 10)
	 * @param categories - Строка с ID категорий через запятую
	 * @returns Промис с массивом объектов ProductModel
	 */
        @Get('low-stock')
        getLowStock(
                @Query(new ValidationPipe({ transform: true }))
                query: LowStockQueryDto
        ): Promise<ProductModel[]> {
                const { threshold = 10, categories } = query
                return this.analyticsService.getLowStockProducts(threshold, categories)
        }
}
