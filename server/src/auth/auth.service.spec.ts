import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { getModelToken } from '@nestjs/sequelize'
import { UserModel } from './user.model'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { AuthDto } from './dto/auth.dto'
import { compare, genSalt, hash } from 'bcryptjs'

jest.mock('bcryptjs')

const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed',
  name: 'Test',
  get: function() { return this }
}

describe('AuthService', () => {
  let service: AuthService
  let userModel: { findOne: jest.Mock; create: jest.Mock }
  let jwt: { signAsync: jest.Mock }

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
      create: jest.fn()
    }
    jwt = { signAsync: jest.fn().mockResolvedValue('token') }
    ;(genSalt as jest.Mock).mockResolvedValue('salt')
    ;(hash as jest.Mock).mockResolvedValue('hashed')
    ;(compare as jest.Mock).mockResolvedValue(true)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(UserModel), useValue: userModel },
        { provide: JwtService, useValue: jwt }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('login success', async () => {
    userModel.findOne.mockResolvedValue(mockUser)
    const dto: AuthDto = { email: 'test@example.com', password: '12345678' }
    const res = await service.login(dto)
    expect(res).toEqual({
      user: { id: 1, email: 'test@example.com', name: 'Test' },
      accessToken: 'token'
    })
    expect(compare).toHaveBeenCalledWith('12345678', 'hashed')
    expect(jwt.signAsync).toHaveBeenCalledWith({ id: 1 }, { expiresIn: '31d' })
  })

  it('login user not found', async () => {
    userModel.findOne.mockResolvedValue(null)
    await expect(
      service.login({ email: 'a@a.com', password: '12345678' })
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('login invalid password', async () => {
    userModel.findOne.mockResolvedValue(mockUser)
    ;(compare as jest.Mock).mockResolvedValue(false)
    await expect(
      service.login({ email: 'test@example.com', password: 'wrong' })
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('register success', async () => {
    userModel.findOne.mockResolvedValue(null)
    userModel.create.mockResolvedValue(mockUser)
    const dto: AuthDto = { email: 'test@example.com', password: '12345678' }
    const res = await service.register(dto)
    expect(res).toEqual({
      user: { id: 1, email: 'test@example.com', name: 'Test' },
      accessToken: 'token'
    })
    expect(hash).toHaveBeenCalled()
  })

  it('register conflict', async () => {
    userModel.findOne.mockResolvedValue(mockUser)
    await expect(
      service.register({ email: 'test@example.com', password: '12345678' })
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('issueAccessToken', async () => {
    const token = await service.issueAccessToken('1')
    expect(token).toBe('token')
    expect(jwt.signAsync).toHaveBeenCalledWith({ id: '1' }, { expiresIn: '31d' })
  })

  it('returnUserFields', () => {
    expect(service.returnUserFields(mockUser as any)).toEqual({
      id: 1,
      email: 'test@example.com',
      name: 'Test'
    })
  })
})

