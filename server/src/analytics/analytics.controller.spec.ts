import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'

describe('AnalyticsController', () => {
  let app: INestApplication
  const service = {
    getRevenue: jest.fn(),
    getTurnover: jest.fn()
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [AnalyticsService]
    })
      .overrideProvider(AnalyticsService)
      .useValue(service)
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
  })

  afterAll(async () => app.close())

  it('/analytics/revenue GET', async () => {
    service.getRevenue.mockResolvedValue(123)
    await request(app.getHttpServer())
      .get('/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31&categories=1,2')
      .expect(200)
      .expect('123')
    expect(service.getRevenue).toHaveBeenCalledWith('2024-01-01', '2024-01-31', [1, 2])
  })

  it('/analytics/turnover GET', async () => {
    const data = { day: 1, week: 2, month: 3, year: 4, allTime: 5 }
    service.getTurnover.mockResolvedValue(data)
    await request(app.getHttpServer())
      .get('/analytics/turnover')
      .expect(200)
      .expect(data)
    expect(service.getTurnover).toHaveBeenCalled()
  })

  it('/analytics/revenue GET 404', async () => {
    service.getRevenue.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/analytics/revenue').expect(404)
  })
})

