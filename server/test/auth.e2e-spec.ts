import { Test } from '@nestjs/testing'
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common'
import request from 'supertest'
import { AuthController } from '../src/auth/auth.controller'
import { AuthService } from '../src/auth/auth.service'

describe('Auth (e2e)', () => {
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => app.close())

  it('/auth/login (POST)', async () => {
    service.login.mockResolvedValue({ ok: true })
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@a.com', password: '12345678' })
      .expect(200)
      .expect({ ok: true })
    expect(service.login).toHaveBeenCalledWith({ email: 'a@a.com', password: '12345678' })
  })

  it('/auth/login (POST) 401', async () => {
    service.login.mockRejectedValue(new UnauthorizedException())
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@a.com', password: '12345678' })
      .expect(401)
  })

  it('/auth/register (POST) validation error', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'bad', password: '1' })
      .expect(400)
  })

  it('/auth/register (POST)', async () => {
    service.register.mockResolvedValue({ ok: true })
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'a@a.com', password: '12345678' })
      .expect(200)
      .expect({ ok: true })
    expect(service.register).toHaveBeenCalledWith({ email: 'a@a.com', password: '12345678' })
  })

  it('/auth/register (POST) 400', async () => {
    service.register.mockRejectedValue(new BadRequestException())
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'a@a.com', password: '12345678' })
      .expect(400)
  })
})

