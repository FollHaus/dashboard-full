import { Test, TestingModule } from '@nestjs/testing'
import { ReportService } from './report.service'
import { getModelToken } from '@nestjs/sequelize'
import { ReportModel } from './report.model'
import { AnalyticsService } from '../analytics/analytics.service'

const mockReport = { id: 1 }

describe('ReportService', () => {
  let service: ReportService
  let repo: { create: jest.Mock; findAll: jest.Mock; findByPk: jest.Mock }
  let analytics: { getKpis: jest.Mock }

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockResolvedValue(mockReport),
      findAll: jest.fn().mockResolvedValue([mockReport]),
      findByPk: jest.fn()
    }
    analytics = { getKpis: jest.fn().mockResolvedValue([]) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: getModelToken(ReportModel), useValue: repo },
        { provide: AnalyticsService, useValue: analytics }
      ]
    }).compile()

    service = module.get<ReportService>(ReportService)
  })

  it('getAvailable', () => {
    const list = service.getAvailable()
    expect(list).toHaveLength(3)
  })

  it('generate', async () => {
    const dto = {
      type: 'sales',
      params: { startDate: '2024-01-01', endDate: '2024-02-01', categories: [] }
    }
    await service.generate(dto as any)
    expect(analytics.getKpis).toHaveBeenCalledWith(
      dto.params.startDate,
      dto.params.endDate,
      dto.params.categories
    )
    expect(repo.create).toHaveBeenCalledWith({
      type: 'sales',
      params: dto.params,
      data: []
    })
  })

  it('getHistory', async () => {
    const res = await service.getHistory()
    expect(res).toEqual([mockReport])
    expect(repo.findAll).toHaveBeenCalled()
  })

  it('export not found', async () => {
    repo.findByPk.mockResolvedValue(null)
    const res = await service.export(1, 'pdf')
    expect(res).toEqual({ message: 'Report 1 not found' })
  })

  it('export success', async () => {
    repo.findByPk.mockResolvedValue({})
    const res = await service.export(1, 'pdf')
    expect(res).toEqual({ message: 'Report 1 exported to pdf' })
  })
})

