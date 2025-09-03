import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { col, fn, Op, literal } from 'sequelize'
import { DateTime } from 'luxon'
import { SaleModel } from '../sale/sale.model'
import { ProductModel } from '../product/product.model'
import { CategoryModel } from '../category/category.model'
import { TaskModel, TaskStatus } from '../task/task.model'

@Injectable()
export class AnalyticsService {
        constructor(
                @InjectModel(SaleModel)
                private readonly saleRepo: typeof SaleModel,
                @InjectModel(ProductModel)
                private readonly productRepo: typeof ProductModel,
                @InjectModel(TaskModel)
                private readonly taskRepo: typeof TaskModel
        ) {}

	/**
	 * Получает общую выручку за определённый период.
	 *
	 * @param startDate - Дата начала периода (строка)
	 * @param endDate - Дата окончания периода (строка)
	 * @param categoryIds - Массив ID категорий для фильтрации
	 * @returns Промис с числом — суммарной выручкой
	 */
        async getRevenue(
                startDate?: string,
                endDate?: string,
                categoryIds?: number[]
        ): Promise<number> {
		const where: any = {}
		if (startDate || endDate) {
			if (startDate && endDate) {
				where.saleDate = { [Op.between]: [startDate, endDate] }
			} else if (startDate) {
				where.saleDate = { [Op.gte]: startDate }
			} else if (endDate) {
				where.saleDate = { [Op.lte]: endDate }
			}
		}
		if (categoryIds && categoryIds.length) {
			where['$product.category_id$'] = { [Op.in]: categoryIds }
		}
                const revenue = await this.saleRepo.sum('totalPrice', {
                        where,
                        // @ts-ignore
                        include:
                                categoryIds && categoryIds.length
                                        ? [{ model: ProductModel, attributes: [] }]
                                        : undefined
                })
                return parseFloat(String(revenue)) || 0
        }

        /**
         * Возвращает сумму продаж по дням за указанный диапазон дат с учётом
         * выбранных категорий.
         */
        async getDailyRevenue(
                startDate?: string,
                endDate?: string,
                categoryIds?: number[]
        ): Promise<{ date: string; total: number }[]> {
                const where: any = {}
                if (startDate || endDate) {
                        if (startDate && endDate) {
                                where.saleDate = { [Op.between]: [startDate, endDate] }
                        } else if (startDate) {
                                where.saleDate = { [Op.gte]: startDate }
                        } else if (endDate) {
                                where.saleDate = { [Op.lte]: endDate }
                        }
                }
                if (categoryIds && categoryIds.length) {
                        where['$product.category_id$'] = { [Op.in]: categoryIds }
                }

                const rows = await this.saleRepo.findAll({
                        attributes: [
                                [col('SaleModel.sale_date'), 'date'],
                                [fn('SUM', col('SaleModel.total_price')), 'total']
                        ],
                        where,
                        include:
                                categoryIds && categoryIds.length
                                        ? [{ model: ProductModel, attributes: [] }]
                                        : undefined,
                        group: [col('SaleModel.sale_date')],
                        order: [[col('SaleModel.sale_date'), 'ASC']],
                        raw: true
                })

                return rows.map((r: any) => ({
                        date: r.date,
                        total: parseFloat(r.total)
                }))
        }

	/**
	 * Получает данные о продажах по категориям за определённый период.
	 *
	 * @param startDate - Дата начала периода (строка)
	 * @param endDate - Дата окончания периода (строка)
	 * @param categoryIds - Массив ID категорий для фильтрации
	 * @returns Промис с массивом объектов данных о продажах по категориям
	 */
        async getSalesByCategories(
                startDate?: string,
                endDate?: string,
                categoryIds?: number[]
        ): Promise<any[]> {
		const whereSales: any = {}
		if (startDate || endDate) {
			if (startDate && endDate) {
				whereSales.saleDate = { [Op.between]: [startDate, endDate] }
			} else if (startDate) {
				whereSales.saleDate = { [Op.gte]: startDate }
			} else if (endDate) {
				whereSales.saleDate = { [Op.lte]: endDate }
			}
		}

		const includeProduct: any = {
			model: ProductModel,
			attributes: [],
			include: [{ model: CategoryModel, attributes: [] }]
		}
		if (categoryIds && categoryIds.length) {
			includeProduct.where = { categoryId: { [Op.in]: categoryIds } }
		}

		const rows = await this.saleRepo.findAll({
                        attributes: [
                                [col('product->category.id'), 'categoryId'],
                                [col('product->category.name'), 'categoryName'],
                                [fn('SUM', col('SaleModel.quantity_sold')), 'totalUnits'],
                                [fn('SUM', col('SaleModel.total_price')), 'totalRevenue']
                        ],
			where: whereSales,
			include: [includeProduct],
			group: [
				'product.category_id',
				'product->category.id',
				'product->category.name'
			],
			raw: true
		})
                return rows
        }

        /**
         * Получает топ товаров по количеству продаж.
         *
         * @param limit - Сколько товаров вернуть (по умолчанию 10)
         * @param startDate - Дата начала периода
         * @param endDate - Дата окончания периода
         * @param categoryIds - Массив ID категорий для фильтрации
         */
        async getTopProducts(
                limit = 10,
                startDate?: string,
                endDate?: string,
                categoryIds?: number[]
        ): Promise<any[]> {
                const whereSales: any = {}
                if (startDate || endDate) {
                        if (startDate && endDate) {
                                whereSales.saleDate = { [Op.between]: [startDate, endDate] }
                        } else if (startDate) {
                                whereSales.saleDate = { [Op.gte]: startDate }
                        } else if (endDate) {
                                whereSales.saleDate = { [Op.lte]: endDate }
                        }
                }

                const includeProduct: any = {
                        model: ProductModel,
                        attributes: [],
                        include: [{ model: CategoryModel, attributes: [] }]
                }
                if (categoryIds && categoryIds.length) {
                        includeProduct.where = { categoryId: { [Op.in]: categoryIds } }
                }

                const rows = await this.saleRepo.findAll({
                        attributes: [
                                [col('product.id'), 'productId'],
                                [col('product.name'), 'productName'],
                                [col('product->category.name'), 'categoryName'],
                                [fn('SUM', col('SaleModel.quantity_sold')), 'totalUnits'],
                                [fn('SUM', col('SaleModel.total_price')), 'totalRevenue']
                        ],
                        where: whereSales,
                        include: [includeProduct],
                        group: [
                                'product.id',
                                'product.name',
                                'product->category.id',
                                'product->category.name'
                        ],
                        order: [[fn('SUM', col('SaleModel.quantity_sold')), 'DESC']],
                        raw: true,
                        ...(limit ? { limit } : {})
                })

                return rows
        }

	/**
	 * Получает список товаров с низким уровнем запасов.
	 *
	 * @param threshold - Пороговое значение количества товара (по умолчанию 10)
	 * @param categoryIds - Массив ID категорий для фильтрации
	 * @returns Промис с массивом объектов ProductModel
	 */
        async getLowStockProducts(
                threshold = 10,
                categoryIds?: number[]
        ): Promise<ProductModel[]> {
                const where: any = { remains: { [Op.lte]: threshold } }
                if (categoryIds && categoryIds.length) {
                        where.categoryId = { [Op.in]: categoryIds }
                }
                return this.productRepo.findAll({ where, include: ['category'] })
        }

        /**
         * Возвращает оборот за день, неделю, месяц, год и за всё время
         * в часовом поясе Europe/Moscow.
         */
        async getTurnover(): Promise<{
                day: number
                week: number
                month: number
                year: number
                allTime: number
        }> {
                const now = DateTime.now().setZone('Europe/Moscow')
                const today = now.toFormat('yyyy-LL-dd')

                const dayStart = now.startOf('day').toFormat('yyyy-LL-dd')
                const weekStart = now
                        .startOf('day')
                        .minus({ days: now.weekday - 1 })
                        .toFormat('yyyy-LL-dd')
                const monthStart = now.startOf('month').toFormat('yyyy-LL-dd')
                const yearStart = now.startOf('year').toFormat('yyyy-LL-dd')

                const [day, week, month, year, allTime] = await Promise.all([
                        this.getRevenue(dayStart, today),
                        this.getRevenue(weekStart, today),
                        this.getRevenue(monthStart, today),
                        this.getRevenue(yearStart, today),
                        this.getRevenue(),
                ])

                return { day, week, month, year, allTime }
        }

        /**
         * Возвращает общее количество товаров на складе.
         */
        async getProductRemains(): Promise<number> {
                const total = await this.productRepo.sum('remains')
                return parseInt(String(total)) || 0
        }

        /**
         * Возвращает количество открытых задач.
         */
        async getOpenTasksCount(): Promise<number> {
                return this.taskRepo.count({
                        where: { status: { [Op.ne]: TaskStatus.Completed } },
                })
        }

        /**
         * Рассчитывает ключевые показатели (KPI) продаж за период
         * с возможностью фильтрации по категориям.
         */
        async getKpis(
                startDate?: string,
                endDate?: string,
                categoryIds?: number[]
        ): Promise<{
                revenue: number
                orders: number
                unitsSold: number
                avgCheck: number
                margin: number
        }> {
                const whereSales: any = {}
                if (startDate || endDate) {
                        if (startDate && endDate) {
                                whereSales.saleDate = { [Op.between]: [startDate, endDate] }
                        } else if (startDate) {
                                whereSales.saleDate = { [Op.gte]: startDate }
                        } else if (endDate) {
                                whereSales.saleDate = { [Op.lte]: endDate }
                        }
                }

                const includeProduct: any = { model: ProductModel, attributes: [] }
                if (categoryIds && categoryIds.length) {
                        includeProduct.where = { categoryId: { [Op.in]: categoryIds } }
                }

                const kpiRow: any = await this.saleRepo.findOne({
                        attributes: [
                                [fn('SUM', col('SaleModel.total_price')), 'revenue'],
                                [fn('COUNT', col('SaleModel.id')), 'orders'],
                                [fn('SUM', col('SaleModel.quantity_sold')), 'unitsSold'],
                                [
                                        fn(
                                                'SUM',
                                                literal(
                                                        '("product"."sale_price" - "product"."purchase_price") * ' +
                                                                '"SaleModel"."quantity_sold"'
                                                )
                                        ),
                                        'margin'
                                ]
                        ],
                        where: whereSales,
                        include: [includeProduct],
                        raw: true
                })

                const revenue = parseFloat(kpiRow?.revenue) || 0
                const orders = parseInt(kpiRow?.orders) || 0
                const unitsSold = parseInt(kpiRow?.unitsSold) || 0
                const margin = parseFloat(kpiRow?.margin) || 0
                const avgCheck = orders > 0 ? revenue / orders : 0

                return { revenue, orders, unitsSold, avgCheck, margin }
        }

        /**
         * Возвращает количество продаж по дням за выбранный период.
         */
        async getSales(
                startDate?: string,
                endDate?: string,
                categoryIds?: number[]
        ): Promise<{ date: string; total: number }[]> {
                const where: any = {}
                if (startDate || endDate) {
                        if (startDate && endDate) {
                                where.saleDate = { [Op.between]: [startDate, endDate] }
                        } else if (startDate) {
                                where.saleDate = { [Op.gte]: startDate }
                        } else if (endDate) {
                                where.saleDate = { [Op.lte]: endDate }
                        }
                }
                if (categoryIds && categoryIds.length) {
                        where['$product.category_id$'] = { [Op.in]: categoryIds }
                }

                const rows = await this.saleRepo.findAll({
                        attributes: [
                                [col('SaleModel.sale_date'), 'date'],
                                [fn('COUNT', col('SaleModel.id')), 'total']
                        ],
                        where,
                        include:
                                categoryIds && categoryIds.length
                                        ? [{ model: ProductModel, attributes: [] }]
                                        : undefined,
                        group: [col('SaleModel.sale_date')],
                        order: [[col('SaleModel.sale_date'), 'ASC']],
                        raw: true
                })

                return rows.map((r: any) => ({
                        date: r.date,
                        total: parseInt(r.total)
                }))
        }
}
