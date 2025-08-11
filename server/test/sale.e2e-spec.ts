import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { SaleModule } from '../src/sale/sale.module'
import { SaleService } from '../src/sale/sale.service'
import { SaleModel } from '../src/sale/sale.model'
import { ProductService } from '../src/product/product.service'
import { ProductModel } from '../src/product/product.model'
import { CategoryModel } from '../src/category/category.model'

describe('Sale (e2e)', () => {
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
      imports: [SaleModule]
    })
      .overrideProvider(SaleService)
      .useValue(service)
      .overrideProvider(ProductService)
      .useValue({})
      .overrideProvider(getModelToken(SaleModel))
      .useValue({})
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

  it('/sales (POST)', async () => {
    const dto = { productId: 1, quantitySold: 1, saleDate: '2024-01-01', totalPrice: 10 }
    const result = { id: 1, ...dto }
    service.createSale.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/sales')
      .send(dto)
      .expect(201)
      .expect(result)
    expect(service.createSale).toHaveBeenCalledWith(dto)
  })

  it('/sales (GET)', async () => {
    const data = [{ id: 1 }]
    service.findAll.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/sales').expect(200).expect(data)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('/sales/:id (GET)', async () => {
    const data = { id: 1 }
    service.findOne.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/sales/1').expect(200).expect(data)
    expect(service.findOne).toHaveBeenCalledWith(1)
  })

  it('/sales/:id (GET) 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/sales/999').expect(404)
  })

  it('/sales/:id (GET) 400', async () => {
    await request(app.getHttpServer()).get('/sales/abc').expect(400)
  })

  it('/sales/:id (PUT)', async () => {
    const dto = { quantitySold: 2 }
    const result = { id: 1 }
    service.update.mockResolvedValue(result)
    await request(app.getHttpServer())
      .put('/sales/1')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.update).toHaveBeenCalledWith(1, dto)
  })

  it('/sales/:id (DELETE)', async () => {
    service.remove.mockResolvedValue(undefined)
    await request(app.getHttpServer()).delete('/sales/1').expect(200)
    expect(service.remove).toHaveBeenCalledWith(1)
  })
})

