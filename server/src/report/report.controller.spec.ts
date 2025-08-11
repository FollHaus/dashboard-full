import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'

describe('ReportController', () => {
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
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
  })

  afterEach(() => jest.clearAllMocks())
  afterAll(async () => app.close())

  it('/reports GET', async () => {
    const data = ['a']
    service.getAvailable.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/reports').expect(200).expect(data)
    expect(service.getAvailable).toHaveBeenCalled()
  })

  it('/reports/generate POST', async () => {
    const dto = { type: 'sales', params: {} }
    const result = { id: 1 }
    service.generate.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/reports/generate')
      .send(dto)
      .expect(201)
      .expect(result)
    expect(service.generate).toHaveBeenCalledWith(dto)
  })

  it('/reports/history GET', async () => {
    const data = [{ id: 1 }]
    service.getHistory.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/reports/history').expect(200).expect(data)
    expect(service.getHistory).toHaveBeenCalled()
  })

  it('/reports/:id/export/:format GET', async () => {
    const result = { ok: true }
    service.export.mockResolvedValue(result)
    await request(app.getHttpServer())
      .get('/reports/1/export/pdf')
      .expect(200)
      .expect(result)
    expect(service.export).toHaveBeenCalledWith(1, 'pdf')
  })

  it('/reports/:id/export/:format GET 404', async () => {
    service.export.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/reports/999/export/pdf').expect(404)
  })

  it('/reports/:id/export/:format GET 400', async () => {
    await request(app.getHttpServer()).get('/reports/abc/export/pdf').expect(400)
  })
})
