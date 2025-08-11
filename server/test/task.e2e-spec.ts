import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { TaskModule } from '../src/task/task.module'
import { TaskService } from '../src/task/task.service'
import { TaskModel } from '../src/task/task.model'

describe('Task (e2e)', () => {
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
      imports: [TaskModule]
    })
      .overrideProvider(TaskService)
      .useValue(service)
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

  it('/task (POST)', async () => {
    service.create.mockResolvedValue({ id: 1, title: 'Test', deadline: '2099-01-01' })
    await request(app.getHttpServer())
      .post('/task')
      .send({ title: 'Test', deadline: '2099-01-01' })
      .expect(201)
      .expect({ id: 1, title: 'Test', deadline: '2099-01-01' })
    expect(service.create).toHaveBeenCalledWith({ title: 'Test', deadline: '2099-01-01' })
  })

  it('/task (GET)', async () => {
    service.findAll.mockResolvedValue([{ id: 1, title: 'A' }])
    await request(app.getHttpServer())
      .get('/task')
      .expect(200)
      .expect([{ id: 1, title: 'A' }])
  })

  it('/task/:id (GET) 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException())
    await request(app.getHttpServer()).get('/task/1').expect(404)
  })

  it('/task/:id (PUT)', async () => {
    service.update.mockResolvedValue({ id: 1, title: 'New' })
    await request(app.getHttpServer())
      .put('/task/1')
      .send({ title: 'New' })
      .expect(200)
      .expect({ id: 1, title: 'New' })
    expect(service.update).toHaveBeenCalledWith(1, { title: 'New' })
  })

  it('/task/:id (DELETE)', async () => {
    service.remove.mockResolvedValue(undefined)
    await request(app.getHttpServer()).delete('/task/1').expect(200)
    expect(service.remove).toHaveBeenCalledWith(1)
  })
})

