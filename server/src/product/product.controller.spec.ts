import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

describe('ProductController', () => {
  let app: INestApplication
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    increaseRemains: jest.fn()
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService]
    })
      .overrideProvider(ProductService)
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

  it('/products POST', async () => {
    const dto = {
      name: 'P',
      articleNumber: 'A1',
      purchasePrice: 1,
      salePrice: 2,
      categoryId: 1
    }
    const result = { id: 1, ...dto }
    service.create.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/products')
      .send(dto)
      .expect(201)
      .expect(result)
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('/products GET', async () => {
    const data = [{ id: 1 }]
    service.findAll.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/products').expect(200).expect(data)
    expect(service.findAll).toHaveBeenCalledWith({
      searchName: undefined,
      searchSku: undefined,
    })
  })

  it('/products/:id GET', async () => {
    const data = { id: 1 }
    service.findOne.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/products/1').expect(200).expect(data)
    expect(service.findOne).toHaveBeenCalledWith(1)
  })

  it('/products/:id GET 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/products/999').expect(404)
  })

  it('/products/:id GET 400', async () => {
    await request(app.getHttpServer()).get('/products/abc').expect(400)
  })

  it('/products/:id PUT', async () => {
    const dto = { name: 'B' }
    const result = { id: 1, name: 'B' }
    service.update.mockResolvedValue(result)
    await request(app.getHttpServer())
      .put('/products/1')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.update).toHaveBeenCalledWith(1, dto)
  })

  it('/products/:id DELETE', async () => {
    service.remove.mockResolvedValue(undefined)
    await request(app.getHttpServer()).delete('/products/1').expect(200)
    expect(service.remove).toHaveBeenCalledWith(1)
  })

  it('/products/:id/stats GET', async () => {
    const data = { totalUnits: 1, totalRevenue: 2 }
    service.getStats.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/products/1/stats').expect(200).expect(data)
    expect(service.getStats).toHaveBeenCalledWith(1)
  })

  it('/products/:id/stock POST', async () => {
    service.increaseRemains.mockResolvedValue(undefined)
    await request(app.getHttpServer())
      .post('/products/1/stock')
      .send({ qty: 5 })
      .expect(201)
      .expect({ message: 'Количество единиц товара 1 увеличено на 5' })
    expect(service.increaseRemains).toHaveBeenCalledWith(1, 5)
  })
})
