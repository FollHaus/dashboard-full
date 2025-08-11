import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { SaleController } from './sale.controller'
import { SaleService } from './sale.service'

describe('SaleController', () => {
  let app: INestApplication
  const service = {
    createSale: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SaleController],
      providers: [SaleService]
    })
      .overrideProvider(SaleService)
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

  it('/sales POST', async () => {
    const dto = {
      productId: 1,
      quantitySold: 1,
      totalPrice: 10,
      saleDate: '2024-01-01'
    }
    const result = { id: 1, ...dto }
    service.createSale.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/sales')
      .send(dto)
      .expect(201)
      .expect(result)
    expect(service.createSale).toHaveBeenCalledWith(dto)
  })

  it('/sales GET', async () => {
    const data = [{ id: 1 }]
    service.findAll.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/sales').expect(200).expect(data)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('/sales/:id GET', async () => {
    const data = { id: 1 }
    service.findOne.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/sales/1').expect(200).expect(data)
    expect(service.findOne).toHaveBeenCalledWith(1)
  })

  it('/sales/:id GET 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/sales/999').expect(404)
  })

  it('/sales/:id GET 400', async () => {
    await request(app.getHttpServer()).get('/sales/abc').expect(400)
  })

  it('/sales/:id PUT', async () => {
    const dto = { quantity: 2 }
    const result = { id: 1 }
    service.update.mockResolvedValue(result)
    await request(app.getHttpServer())
      .put('/sales/1')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.update).toHaveBeenCalledWith(1, dto)
  })

  it('/sales/:id DELETE', async () => {
    service.remove.mockResolvedValue(undefined)
    await request(app.getHttpServer()).delete('/sales/1').expect(200)
    expect(service.remove).toHaveBeenCalledWith(1)
  })
})
