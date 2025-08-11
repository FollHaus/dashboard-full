import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

describe('TaskController', () => {
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
      controllers: [TaskController],
      providers: [TaskService]
    })
      .overrideProvider(TaskService)
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

  it('/task POST', async () => {
    const dto = { title: 'T', deadline: '2099-01-01' }
    const result = { id: 1, ...dto }
    service.create.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/task')
      .send(dto)
      .expect(201)
      .expect(result)
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('/task GET', async () => {
    const data = [{ id: 1 }]
    service.findAll.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/task').expect(200).expect(data)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('/task/:id GET', async () => {
    const data = { id: 1 }
    service.findOne.mockResolvedValue(data)
    await request(app.getHttpServer()).get('/task/1').expect(200).expect(data)
    expect(service.findOne).toHaveBeenCalledWith(1)
  })

  it('/task/:id GET 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/task/999').expect(404)
  })

  it('/task/:id GET 400', async () => {
    await request(app.getHttpServer()).get('/task/abc').expect(400)
  })

  it('/task/:id PUT', async () => {
    const dto = { title: 'B' }
    const result = { id: 1, title: 'B' }
    service.update.mockResolvedValue(result)
    await request(app.getHttpServer())
      .put('/task/1')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.update).toHaveBeenCalledWith(1, dto)
  })

  it('/task/:id DELETE', async () => {
    service.remove.mockResolvedValue(undefined)
    await request(app.getHttpServer()).delete('/task/1').expect(200)
    expect(service.remove).toHaveBeenCalledWith(1)
  })
})
