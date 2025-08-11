import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { col, fn, Op } from 'sequelize'
import { SaleModel } from '../sale/sale.model'
import { ProductModel } from '../product/product.model'
import { CategoryModel } from '../category/category.model'

@Injectable()
export class AnalyticsService {
	constructor(
		@InjectModel(SaleModel)
		private readonly saleRepo: typeof SaleModel,
		@InjectModel(ProductModel)
		private readonly productRepo: typeof ProductModel
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
				[fn('SUM', col('quantity_sold')), 'totalUnits'],
				[fn('SUM', col('total_price')), 'totalRevenue']
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
                                [fn('SUM', col('quantity_sold')), 'totalUnits'],
                                [fn('SUM', col('total_price')), 'totalRevenue']
                        ],
                        where: whereSales,
                        include: [includeProduct],
                        group: [
                                'product.id',
                                'product.name',
                                'product->category.id',
                                'product->category.name'
                        ],
                        order: [[fn('SUM', col('quantity_sold')), 'DESC']],
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
         * Возвращает сумму продаж по дням за выбранный период.
         *
         * @param period - Количество дней (7, 14, 30, 365)
         */
        async getSales(period: number): Promise<{ date: string; total: number }[]> {
                const endDate = new Date()
                const startDate = new Date()
                startDate.setDate(endDate.getDate() - (period - 1))

                const rows = await this.saleRepo.findAll({
                        attributes: [
                                [col('sale_date'), 'date'],
                                [fn('SUM', col('total_price')), 'total']
                        ],
                        where: {
                                saleDate: {
                                        [Op.between]: [
                                                startDate.toISOString().slice(0, 10),
                                                endDate.toISOString().slice(0, 10)
                                        ]
                                }
                        },
                        group: [col('sale_date')],
                        order: [[col('sale_date'), 'ASC']],
                        raw: true
                })

                return rows.map((r: any) => ({
                        date: r.date,
                        total: parseFloat(r.total)
                }))
        }
}
