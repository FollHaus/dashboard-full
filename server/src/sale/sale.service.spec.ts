import { SaleService } from './sale.service'
import { UpdateSaleDto } from './dto/update.sale.dto'
import { CreateSaleDto } from './dto/sale.dto'

describe('SaleService.update', () => {
        it('should handle product change with stock adjustments and price recalculation', async () => {
                const sale: any = {
                        id: 1,
                        productId: 1,
                        quantitySold: 5,
                        saleDate: '2024-01-01',
                        product: { salePrice: 10 },
                        update: jest.fn(function (data) {
                                Object.assign(this, data)
                        })
                }

                const saleRepo = {
                        findByPk: jest.fn().mockResolvedValue(sale)
                }

                const productService = {
                        increaseRemains: jest.fn().mockResolvedValue(undefined),
                        decreaseRemains: jest.fn().mockResolvedValue(undefined),
                        findOne: jest
                                .fn()
                                .mockResolvedValue({ salePrice: 20 })
                }

                const trx = {}
                const sequelize = {
                        transaction: (cb: any) => cb(trx)
                }

                const service = new SaleService(
                        saleRepo as any,
                        sequelize as any,
                        productService as any
                )

                const dto: UpdateSaleDto = { productId: 2, quantitySold: 3 }
                await service.update(1, dto)

                expect(productService.increaseRemains).toHaveBeenCalledWith(
                        1,
                        5,
                        trx
                )
                expect(productService.decreaseRemains).toHaveBeenCalledWith(
                        2,
                        3,
                        trx
                )
                expect(productService.findOne).toHaveBeenCalledWith(2, trx)
                expect(sale.update).toHaveBeenCalledWith(
                        {
                                productId: 2,
                                quantitySold: 3,
                                saleDate: '2024-01-01',
                                totalPrice: 60
                        },
                        { transaction: trx }
                )
        })
})

describe('SaleService.createSale transactions', () => {
        it('commits on success', async () => {
                const saleRepo = { create: jest.fn().mockResolvedValue({}) }
                const productService = {
                        decreaseRemains: jest.fn().mockResolvedValue(undefined),
                        findOne: jest.fn().mockResolvedValue({ salePrice: 10 })
                }
                const commit = jest.fn()
                const rollback = jest.fn()
                const sequelize = {
                        transaction: jest.fn(async (cb: any) => {
                                const trx = { commit, rollback }
                                const res = await cb(trx)
                                await commit()
                                return res
                        })
                }
                const service = new SaleService(
                        saleRepo as any,
                        sequelize as any,
                        productService as any
                )
                const dto: CreateSaleDto = {
                        productId: 1,
                        quantitySold: 2,
                        saleDate: '2024-01-01',
                        totalPrice: 0 as any
                }
                await service.createSale(dto)
                expect(sequelize.transaction).toHaveBeenCalled()
                expect(productService.decreaseRemains).toHaveBeenCalledWith(
                        1,
                        2,
                        expect.any(Object)
                )
                expect(commit).toHaveBeenCalled()
                expect(rollback).not.toHaveBeenCalled()
        })

        it('rolls back on error', async () => {
                const saleRepo = { create: jest.fn() }
                const productService = {
                        decreaseRemains: jest
                                .fn()
                                .mockRejectedValue(new Error('fail')),
                        findOne: jest.fn()
                }
                const commit = jest.fn()
                const rollback = jest.fn()
                const sequelize = {
                        transaction: jest.fn(async (cb: any) => {
                                const trx = { commit, rollback }
                                try {
                                        const res = await cb(trx)
                                        await commit()
                                        return res
                                } catch (e) {
                                        await rollback()
                                        throw e
                                }
                        })
                }
                const service = new SaleService(
                        saleRepo as any,
                        sequelize as any,
                        productService as any
                )
                const dto: CreateSaleDto = {
                        productId: 1,
                        quantitySold: 2,
                        saleDate: '2024-01-01',
                        totalPrice: 0 as any
                }
                await expect(service.createSale(dto)).rejects.toThrow('fail')
                expect(commit).not.toHaveBeenCalled()
                expect(rollback).toHaveBeenCalled()
        })
})
