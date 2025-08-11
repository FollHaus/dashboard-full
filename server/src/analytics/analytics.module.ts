import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { SaleModel } from '../sale/sale.model'
import { ProductModel } from '../product/product.model'
import { CategoryModel } from '../category/category.model'
import { TaskModel } from '../task/task.model'

/**
 * Модуль аналитики, отвечающий за маршруты и логику получения аналитических данных.
 */
@Module({
	imports: [
                // Регистрация моделей, используемых в сервисе аналитики
                SequelizeModule.forFeature([SaleModel, ProductModel, CategoryModel, TaskModel])
	],
        controllers: [AnalyticsController], // Регистрация контроллера аналитики
        providers: [AnalyticsService], // Регистрация сервиса аналитики
        exports: [AnalyticsService]
})
export class AnalyticsModule {}
