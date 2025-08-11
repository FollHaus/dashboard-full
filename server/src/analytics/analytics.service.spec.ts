import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { DateTime } from 'luxon'
import { AnalyticsService } from './analytics.service'
import { SaleModel } from '../sale/sale.model'
import { ProductModel } from '../product/product.model'
import { TaskModel } from '../task/task.model'

describe('AnalyticsService', () => {
  let service: AnalyticsService
  const saleRepo = { sum: jest.fn(), findAll: jest.fn(), findOne: jest.fn() }
  const productRepo = { findAll: jest.fn(), sum: jest.fn() }
  const taskRepo = { count: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getModelToken(SaleModel), useValue: saleRepo },
        { provide: getModelToken(ProductModel), useValue: productRepo },
        { provide: getModelToken(TaskModel), useValue: taskRepo }
      ]
    }).compile()

    service = module.get<AnalyticsService>(AnalyticsService)
    jest.clearAllMocks()
  })

  describe('getRevenue', () => {
    it('calculates revenue with filters', async () => {
      saleRepo.sum.mockResolvedValue('100')
      const result = await service.getRevenue('2024-01-01', '2024-01-31', [1, 2])
      expect(saleRepo.sum).toHaveBeenCalledWith('totalPrice', expect.objectContaining({
        where: expect.objectContaining({
          saleDate: { [Op.between]: ['2024-01-01', '2024-01-31'] },
          '$product.category_id$': { [Op.in]: [1, 2] }
        }),
        include: [{ model: ProductModel, attributes: [] }]
      }))
      expect(result).toBe(100)
    })

    it('returns 0 when repository returns null', async () => {
      saleRepo.sum.mockResolvedValue(null)
      const result = await service.getRevenue()
      expect(result).toBe(0)
    })
  })

  describe('getDailyRevenue', () => {
    it('maps results correctly', async () => {
      saleRepo.findAll.mockResolvedValue([
        { date: '2024-01-01', total: '50' },
        { date: '2024-01-02', total: '70' }
      ])
      const result = await service.getDailyRevenue('2024-01-01', '2024-01-02')
      expect(saleRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          saleDate: { [Op.between]: ['2024-01-01', '2024-01-02'] }
        }),
        group: [expect.anything()],
        order: [[expect.anything(), 'ASC']],
        raw: true
      }))
      expect(result).toEqual([
        { date: '2024-01-01', total: 50 },
        { date: '2024-01-02', total: 70 }
      ])
    })
  })

  describe('getTurnover', () => {
    it('aggregates revenues for different periods', async () => {
      jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO('2024-03-15T12:00:00'))
      const spy = jest
        .spyOn(service, 'getRevenue')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(5)

      const result = await service.getTurnover()
      expect(spy).toHaveBeenNthCalledWith(1, '2024-03-15', '2024-03-15')
      expect(spy).toHaveBeenNthCalledWith(2, '2024-03-11', '2024-03-15')
      expect(spy).toHaveBeenNthCalledWith(3, '2024-03-01', '2024-03-15')
      expect(spy).toHaveBeenNthCalledWith(4, '2024-01-01', '2024-03-15')
      expect(spy.mock.calls[4]).toEqual([])
      expect(result).toEqual({ day: 1, week: 2, month: 3, year: 4, allTime: 5 })
    })
  })

  describe('getKpis', () => {
    it('returns calculated kpis', async () => {
      saleRepo.findOne.mockResolvedValue({
        revenue: '100',
        orders: '5',
        unitsSold: '20',
        margin: '30'
      })
      taskRepo.count.mockResolvedValue(2)

      const result = await service.getKpis('2024-01-01', '2024-01-31', [1])

      expect(saleRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          saleDate: { [Op.between]: ['2024-01-01', '2024-01-31'] }
        }),
        include: [expect.objectContaining({ where: { categoryId: { [Op.in]: [1] } } })],
        raw: true
      }))
      expect(taskRepo.count).toHaveBeenCalled()
      expect(result).toEqual({
        revenue: 100,
        orders: 5,
        unitsSold: 20,
        avgCheck: 20,
        margin: 30,
        completedTasks: 2
      })
    })
  })

  describe('getSales', () => {
    it('builds date range and maps result', async () => {
      saleRepo.findAll.mockResolvedValue([{ date: '2024-01-01', total: '40' }])
      const result = await service.getSales(7)
      expect(saleRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          saleDate: { [Op.between]: [expect.any(String), expect.any(String)] }
        })
      }))
      expect(result).toEqual([{ date: '2024-01-01', total: 40 }])
    })
  })
})

