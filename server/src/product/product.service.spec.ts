import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Op } from 'sequelize'
jest.mock('./product.model', () => ({}), { virtual: true })
jest.mock('../category/category.model', () => ({}), { virtual: true })
jest.mock('@nestjs/sequelize', () => ({
        InjectModel: () => () => {},
        InjectConnection: () => () => {}
}))
import { ProductService } from './product.service'

describe('ProductService', () => {
        let service: ProductService
        let productRepo: any
        let categoryRepo: any
        let sequelize: any

        beforeEach(() => {
                productRepo = {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findByPk: jest.fn(),
                        decrement: jest.fn()
                }
                categoryRepo = {
                        findByPk: jest.fn(),
                        findOrCreate: jest.fn()
                }
                sequelize = { transaction: jest.fn() }
                service = new ProductService(
                        productRepo as any,
                        categoryRepo as any,
                        sequelize as any
                )
        })

        describe('create', () => {
                it('creates product with categoryId', async () => {
                        const dto = {
                                name: 'P',
                                articleNumber: 'A',
                                purchasePrice: 1,
                                salePrice: 2,
                                categoryId: 1
                        }
                        categoryRepo.findByPk.mockResolvedValue({ id: 1 })
                        const created = { id: 1, ...dto, remains: 0, minStock: 0 }
                        productRepo.create.mockResolvedValue(created)
                        await expect(service.create(dto as any)).resolves.toEqual(created)
                        expect(categoryRepo.findByPk).toHaveBeenCalledWith(1)
                        expect(productRepo.create).toHaveBeenCalledWith({
                                name: 'P',
                                categoryId: 1,
                                articleNumber: 'A',
                                purchasePrice: 1,
                                salePrice: 2,
                                remains: 0,
                                minStock: 0
                        })
                })

                it('throws if categoryId not found', async () => {
                        const dto = {
                                name: 'P',
                                articleNumber: 'A',
                                purchasePrice: 1,
                                salePrice: 2,
                                categoryId: 1
                        }
                        categoryRepo.findByPk.mockResolvedValue(null)
                        await expect(service.create(dto as any)).rejects.toThrow(NotFoundException)
                })

                it('creates product with categoryName', async () => {
                        const dto = {
                                name: 'P',
                                articleNumber: 'A',
                                purchasePrice: 1,
                                salePrice: 2,
                                categoryName: 'Cat'
                        }
                        categoryRepo.findOrCreate.mockResolvedValue([{ id: 5 }])
                        productRepo.create.mockResolvedValue({})
                        await service.create(dto as any)
                        expect(categoryRepo.findOrCreate).toHaveBeenCalledWith({
                                where: { name: 'Cat' },
                                defaults: { name: 'Cat' }
                        })
                        expect(productRepo.create).toHaveBeenCalledWith(
                                expect.objectContaining({ categoryId: 5 })
                        )
                })

                it('throws when no category provided', async () => {
                        const dto = {
                                name: 'P',
                                articleNumber: 'A',
                                purchasePrice: 1,
                                salePrice: 2
                        }
                        await expect(service.create(dto as any)).rejects.toThrow(
                                BadRequestException
                        )
                })
        })

        describe('findAll', () => {
                it('returns products', async () => {
                        const list: any[] = []
                        productRepo.findAll.mockResolvedValue(list)
                        await expect(service.findAll()).resolves.toBe(list)
                        expect(productRepo.findAll).toHaveBeenCalledWith({
                                where: {},
                                include: [
                                        expect.objectContaining({
                                                as: 'category',
                                                required: false
                                        }),
                                        'sales'
                                ]
                        })
                })

                it('applies search filter', async () => {
                        productRepo.findAll.mockResolvedValue([])
                        await service.findAll({ search: 'abc' })
                        expect(productRepo.findAll).toHaveBeenCalledWith(
                                expect.objectContaining({
                                        where: expect.objectContaining({
                                                [Op.or]: expect.any(Array)
                                        })
                                })
                        )
                })
        })

        describe('findOne', () => {
                it('returns product', async () => {
                        const prod = { id: 1 }
                        productRepo.findByPk.mockResolvedValue(prod)
                        await expect(service.findOne(1)).resolves.toBe(prod)
                        expect(productRepo.findByPk).toHaveBeenCalledWith(1, {
                                include: ['category', 'sales'],
                                transaction: undefined
                        })
                })

                it('throws NotFoundException', async () => {
                        productRepo.findByPk.mockResolvedValue(null)
                        await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
                })
        })

        describe('update', () => {
                it('updates product fields', async () => {
                        const prod = { update: jest.fn().mockResolvedValue({}) }
                        jest.spyOn(service, 'findOne').mockResolvedValue(prod as any)
                        const dto = { name: 'N' }
                        await service.update(1, dto as any)
                        expect(prod.update).toHaveBeenCalledWith(dto)
                })

                it('updates category by id', async () => {
                        const prod = { update: jest.fn().mockResolvedValue({}) }
                        jest.spyOn(service, 'findOne').mockResolvedValue(prod as any)
                        categoryRepo.findByPk.mockResolvedValue({ id: 2 })
                        await service.update(1, { categoryId: 2 } as any)
                        expect(categoryRepo.findByPk).toHaveBeenCalledWith(2)
                        expect(prod.update).toHaveBeenCalledWith({ categoryId: 2 })
                })

                it('throws if new category not found', async () => {
                        const prod = { update: jest.fn() }
                        jest.spyOn(service, 'findOne').mockResolvedValue(prod as any)
                        categoryRepo.findByPk.mockResolvedValue(null)
                        await expect(
                                service.update(1, { categoryId: 2 } as any)
                        ).rejects.toThrow(NotFoundException)
                })
        })

        describe('remove', () => {
                it('destroys product', async () => {
                        const prod = { destroy: jest.fn() }
                        jest.spyOn(service, 'findOne').mockResolvedValue(prod as any)
                        await service.remove(1)
                        expect(prod.destroy).toHaveBeenCalled()
                })
        })

        describe('getStats', () => {
                it('calculates totals', async () => {
                        const prod = {
                                sales: [
                                        { quantitySold: 2, totalPrice: '5' },
                                        { quantitySold: 3, totalPrice: '7' }
                                ]
                        }
                        jest.spyOn(service, 'findOne').mockResolvedValue(prod as any)
                        await expect(service.getStats(1)).resolves.toEqual({
                                totalUnits: 5,
                                totalRevenue: 12
                        })
                })
        })

        describe('decreaseRemains', () => {
                it('throws when remains are insufficient', async () => {
                        jest.spyOn(service, 'findOne').mockResolvedValue({
                                id: 1,
                                remains: 1
                        } as any)
                        const trx = {} as any
                        await expect(
                                service.decreaseRemains(1, 5, trx)
                        ).rejects.toThrow(BadRequestException)
                        expect(productRepo.decrement).not.toHaveBeenCalled()
                })

                it('decrements when enough remains', async () => {
                        jest.spyOn(service, 'findOne').mockResolvedValue({
                                id: 1,
                                remains: 10
                        } as any)
                        const trx = {} as any
                        await service.decreaseRemains(1, 5, trx)
                        expect(productRepo.decrement).toHaveBeenCalledWith(
                                { remains: 5 },
                                { where: { id: 1 }, transaction: trx }
                        )
                })

                it('uses transaction and commits when trx not provided', async () => {
                        jest.spyOn(service, 'findOne').mockResolvedValue({
                                id: 1,
                                remains: 10
                        } as any)
                        const commit = jest.fn()
                        const rollback = jest.fn()
                        sequelize.transaction.mockImplementation(async (cb) => {
                                const trx = { commit, rollback }
                                const res = await cb(trx)
                                await commit()
                                return res
                        })
                        await service.decreaseRemains(1, 5)
                        expect(sequelize.transaction).toHaveBeenCalled()
                        expect(productRepo.decrement).toHaveBeenCalled()
                        expect(commit).toHaveBeenCalled()
                        expect(rollback).not.toHaveBeenCalled()
                })

                it('rolls back transaction on error', async () => {
                        jest.spyOn(service, 'findOne').mockResolvedValue({
                                id: 1,
                                remains: 1
                        } as any)
                        const commit = jest.fn()
                        const rollback = jest.fn()
                        sequelize.transaction.mockImplementation(async (cb) => {
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
                        await expect(service.decreaseRemains(1, 5)).rejects.toThrow(
                                BadRequestException
                        )
                        expect(commit).not.toHaveBeenCalled()
                        expect(rollback).toHaveBeenCalled()
                })
        })
})

