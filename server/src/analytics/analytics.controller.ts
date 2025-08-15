import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AnalyticsService } from './analytics.service'
import { ProductModel } from '../product/product.model'
import { AnalyticsQueryDto } from './dto/analytics.query.dto'
import { LowStockQueryDto } from './dto/low-stock.query.dto'
import { TopProductsQueryDto } from './dto/top-products.query.dto'

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
         * Возвращает суммы продаж по дням за выбранный диапазон.
         */
        @Get('daily-revenue')
        getDailyRevenue(
                @Query(new ValidationPipe({ transform: true }))
                query: AnalyticsQueryDto
        ) {
                const { startDate, endDate, categories } = query
                return this.analyticsService.getDailyRevenue(startDate, endDate, categories)
        }

        /**
         * Возвращает оборот за день, неделю, месяц, год и всё время.
         */
        @Get('turnover')
        getTurnover() {
                return this.analyticsService.getTurnover()
        }

        /**
         * Возвращает общее количество товаров на складе.
         */
        @Get('product-remains')
        getProductRemains() {
                return this.analyticsService.getProductRemains()
        }

        /**
         * Возвращает количество открытых задач.
         */
        @Get('open-tasks')
        getOpenTasks() {
                return this.analyticsService.getOpenTasksCount()
        }

        /**
         * Рассчитывает KPI продаж за период.
         */
        @Get('kpis')
        getKpis(
                @Query(new ValidationPipe({ transform: true }))
                query: AnalyticsQueryDto
        ) {
                const { startDate, endDate, categories } = query
                return this.analyticsService.getKpis(startDate, endDate, categories)
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
         * Получает топ товаров по продажам.
         *
         * @param limit - Сколько товаров вернуть (по умолчанию 10)
         * @param categories - Строка с ID категорий через запятую
         */
        @Get('top-products')
        getTopProducts(
                @Query(new ValidationPipe({ transform: true }))
                query: TopProductsQueryDto
        ): Promise<any[]> {
                const { limit, startDate, endDate, categories } = query
                return this.analyticsService.getTopProducts(limit, startDate, endDate, categories)
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

        /**
         * Возвращает количество продаж по дням за выбранный период.
         */
        @Get('sales')
        getSales(
                @Query(new ValidationPipe({ transform: true }))
                query: AnalyticsQueryDto
        ) {
                const { startDate, endDate, categories } = query
                return this.analyticsService.getSales(startDate, endDate, categories)
        }
}
