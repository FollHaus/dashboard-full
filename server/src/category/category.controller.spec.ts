import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'

describe('CategoryController', () => {
  let app: INestApplication
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService]
    })
      .overrideProvider(CategoryService)
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

  it('/category POST', async () => {
    const dto = { name: 'Cat' }
    const result = { id: 1, ...dto }
    service.create.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/category')
      .send(dto)
      .expect(201)
      .expect(result)
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('/category GET', async () => {
    const data = [{ id: 1, name: 'A' }]
    service.findAll.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/category').expect(200).expect(data)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('/category/:id GET', async () => {
    const data = { id: 1, name: 'A' }
    service.findOne.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/category/1').expect(200).expect(data)
    expect(service.findOne).toHaveBeenCalledWith(1)
  })

  it('/category/:id GET 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/category/999').expect(404)
  })

  it('/category/:id GET 400', async () => {
    await request(app.getHttpServer()).get('/category/abc').expect(400)
  })

  it('/category/:id PUT', async () => {
    const dto = { name: 'B' }
    const result = { id: 1, name: 'B' }
    service.update.mockResolvedValue(result)
    await request(app.getHttpServer())
      .put('/category/1')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.update).toHaveBeenCalledWith(1, dto)
  })

  it('/category/:id DELETE', async () => {
    service.remove.mockResolvedValue(undefined)
    await request(app.getHttpServer()).delete('/category/1').expect(200)
    expect(service.remove).toHaveBeenCalledWith(1)
  })
})
