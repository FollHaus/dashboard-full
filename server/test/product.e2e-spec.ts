import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { ProductModule } from '../src/product/product.module'
import { ProductService } from '../src/product/product.service'
import { ProductModel } from '../src/product/product.model'
import { CategoryModel } from '../src/category/category.model'

describe('Product (e2e)', () => {
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
      imports: [ProductModule]
    })
      .overrideProvider(ProductService)
      .useValue(service)
      .overrideProvider(getModelToken(ProductModel))
      .useValue({})
      .overrideProvider(getModelToken(CategoryModel))
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
  afterEach(() => jest.clearAllMocks())

  it('/products (POST)', async () => {
    const dto = {
      name: 'P',
      articleNumber: 'A',
      purchasePrice: 10,
      salePrice: 20,
      categoryName: 'C',
      remains: 5
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

  it('/products (GET)', async () => {
    const data = [{ id: 1 }]
    service.findAll.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/products').expect(200).expect(data)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('/products/:id (GET)', async () => {
    const data = { id: 1 }
    service.findOne.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/products/1').expect(200).expect(data)
    expect(service.findOne).toHaveBeenCalledWith(1)
  })

  it('/products/:id (GET) 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/products/999').expect(404)
  })

  it('/products/:id (GET) 400', async () => {
    await request(app.getHttpServer()).get('/products/abc').expect(400)
  })

  it('/products/:id (PUT)', async () => {
    const dto = { name: 'N' }
    const result = { id: 1, name: 'N' }
    service.update.mockResolvedValue(result)
    await request(app.getHttpServer())
      .put('/products/1')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.update).toHaveBeenCalledWith(1, dto)
  })

  it('/products/:id (DELETE)', async () => {
    service.remove.mockResolvedValue(undefined)
    await request(app.getHttpServer()).delete('/products/1').expect(200)
    expect(service.remove).toHaveBeenCalledWith(1)
  })

  it('/products/:id/stats (GET)', async () => {
    const stats = { totalUnits: 5, totalRevenue: 100 }
    service.getStats.mockResolvedValue(stats)
    await request(app.getHttpServer())
      .get('/products/1/stats')
      .expect(200)
      .expect(stats)
    expect(service.getStats).toHaveBeenCalledWith(1)
  })

  it('/products/:id/stock (POST)', async () => {
    service.increaseRemains.mockResolvedValue(undefined)
    await request(app.getHttpServer())
      .post('/products/1/stock')
      .send({ qty: 2 })
      .expect(201)
      .expect({ message: 'Количество единиц товара 1 увеличено на 2' })
    expect(service.increaseRemains).toHaveBeenCalledWith(1, 2)
  })
})

