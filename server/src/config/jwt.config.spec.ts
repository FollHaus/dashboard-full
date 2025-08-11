import { getJWTConfig } from './jwt.config'

describe('getJWTConfig', () => {
  it('returns secret from config', async () => {
    const configService = { get: jest.fn().mockReturnValue('secret') } as any
    await expect(getJWTConfig(configService)).resolves.toEqual({ secret: 'secret' })
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET')
  })

  it('handles missing secret', async () => {
    const configService = { get: jest.fn().mockReturnValue(undefined) } as any
    await expect(getJWTConfig(configService)).resolves.toEqual({ secret: undefined })
  })
})
