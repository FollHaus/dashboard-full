import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { AnalyticsModule } from '../src/analytics/analytics.module'
import { AnalyticsService } from '../src/analytics/analytics.service'
import { SaleModel } from '../src/sale/sale.model'
import { ProductModel } from '../src/product/product.model'
import { CategoryModel } from '../src/category/category.model'
import { TaskModel } from '../src/task/task.model'

describe('Analytics (e2e)', () => {
  let app: INestApplication
  const service = { getRevenue: jest.fn() }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AnalyticsModule]
    })
      .overrideProvider(AnalyticsService)
      .useValue(service)
      .overrideProvider(getModelToken(SaleModel))
      .useValue({})
      .overrideProvider(getModelToken(ProductModel))
      .useValue({})
      .overrideProvider(getModelToken(CategoryModel))
      .useValue({})
      .overrideProvider(getModelToken(TaskModel))
      .useValue({})
      .overrideProvider(getConnectionToken())
      .useValue({})
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => app.close())

  it('/analytics/revenue (GET)', async () => {
    service.getRevenue.mockResolvedValue(200)
    await request(app.getHttpServer())
      .get('/analytics/revenue')
      .expect(200)
      .expect('200')
  })

  it('/analytics/revenue (GET) 404', async () => {
    service.getRevenue.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/analytics/revenue').expect(404)
  })
})

