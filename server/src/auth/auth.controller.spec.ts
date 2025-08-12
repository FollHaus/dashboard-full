import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException
} from '@nestjs/common'
import request from 'supertest'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let app: INestApplication
  const service = {
    login: jest.fn(),
    register: jest.fn()
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService]
    })
      .overrideProvider(AuthService)
      .useValue(service)
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
  })

  afterEach(() => jest.clearAllMocks())
  afterAll(async () => app.close())

  it('/auth/login POST', async () => {
    const dto = { email: 'a@test.com', password: 'password' }
    const result = { token: 't' }
    service.login.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.login).toHaveBeenCalledWith(dto)
  })

  it('/auth/login POST 401', async () => {
    const dto = { email: 'a@test.com', password: 'badpass1' }
    service.login.mockRejectedValue(new UnauthorizedException())
    await request(app.getHttpServer()).post('/auth/login').send(dto).expect(401)
  })

  it('/auth/register POST', async () => {
    const dto = { name: 'A', email: 'a@test.com', password: 'password' }
    const result = { ok: true }
    service.register.mockResolvedValue(result)
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto)
      .expect(200)
      .expect(result)
    expect(service.register).toHaveBeenCalledWith(dto)
  })

  it('/auth/register POST 400', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({}).expect(400)
  })
})
