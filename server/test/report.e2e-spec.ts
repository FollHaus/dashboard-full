import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { ReportController } from '../src/report/report.controller'
import { ReportService } from '../src/report/report.service'

describe('Report (e2e)', () => {
  let app: INestApplication
  const service = {
    getAvailable: jest.fn(),
    generate: jest.fn(),
    getHistory: jest.fn(),
    export: jest.fn()
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [ReportService]
    })
      .overrideProvider(ReportService)
      .useValue(service)
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => app.close())

  it('/reports (GET)', async () => {
    service.getAvailable.mockReturnValue([{ id: 1 }])
    await request(app.getHttpServer())
      .get('/reports')
      .expect(200)
      .expect([{ id: 1 }])
  })

  it('/reports/generate (POST)', async () => {
    service.generate.mockResolvedValue({ id: 1 })
    await request(app.getHttpServer())
      .post('/reports/generate')
      .send({ type: 'sales', params: {} })
      .expect(201)
      .expect({ id: 1 })
    expect(service.generate).toHaveBeenCalledWith({ type: 'sales', params: {} })
  })

  it('/reports/generate (POST) 404', async () => {
    service.generate.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer())
      .post('/reports/generate')
      .send({ type: 'sales', params: {} })
      .expect(404)
  })

  it('/reports/history (GET)', async () => {
    service.getHistory.mockResolvedValue([{ id: 1 }])
    await request(app.getHttpServer())
      .get('/reports/history')
      .expect(200)
      .expect([{ id: 1 }])
  })

  it('/reports/:id/export/:format (GET)', async () => {
    service.export.mockResolvedValue({ message: 'ok' })
    await request(app.getHttpServer())
      .get('/reports/1/export/pdf')
      .expect(200)
      .expect({ message: 'ok' })
    expect(service.export).toHaveBeenCalledWith(1, 'pdf')
  })
})

